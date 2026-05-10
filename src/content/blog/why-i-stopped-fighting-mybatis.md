---
title: "Why I stopped fighting MyBatis and started liking it"
description: "Notes from a year on a hotel system running Spring Boot + MyBatis + Elasticsearch. The XML mapper aesthetic is unfashionable; the trade-offs are real."
pubDate: 2026-05-12
tags: [java, spring-boot, mybatis, elasticsearch]
---

I came onto a Spring Boot codebase at the start of last year that uses MyBatis as its
persistence layer, with Elasticsearch as a parallel search index. My instinctive reaction
was *why aren't we using JPA?* A year in, I think the choice was right, and I want to
write down why before I forget.

This isn't an argument that MyBatis is better than JPA. It's an argument that for a
read-heavy domain with complex query shapes — which describes a lot of business
software, including hotels — MyBatis stops being the worse choice and starts being the
honest one.

## Where MyBatis is actually pleasant

The hotel system has a search query that takes filters for date range, room type,
location, rate plan, occupancy, and a half-dozen optional facets. In JPA, that's a
`CriteriaBuilder` mess where you build the predicate tree conditionally and people stop
modifying it because they're scared. In MyBatis, it's:

```xml
<select id="searchRooms" resultMap="RoomResult">
  SELECT r.*
  FROM   room r
  JOIN   room_type t ON t.id = r.room_type_id
  <where>
    <if test="locationId != null">
      AND r.location_id = #{locationId}
    </if>
    <if test="checkIn != null and checkOut != null">
      AND r.id NOT IN (
        SELECT room_id FROM booking
        WHERE  status = 'CONFIRMED'
        AND    NOT (checkout_at &lt;= #{checkIn} OR checkin_at &gt;= #{checkOut})
      )
    </if>
    <if test="roomTypeIds != null and !roomTypeIds.isEmpty()">
      AND r.room_type_id IN
      <foreach collection="roomTypeIds" item="id" open="(" separator="," close=")">
        #{id}
      </foreach>
    </if>
  </where>
</select>
```

The XML is the SQL, with control-flow holes punched in it. A reviewer can read it like
SQL. A DBA can copy it into their tool of choice and tune the index strategy without
guessing what the ORM will emit. There is no auto-flush, no dirty checking, no second-
level cache pretending to know better.

For a query that gets executed thousands of times a minute and shapes per filter combo,
that legibility is worth more than the ergonomics of `Repository<T>` interfaces.

## Where it still bites you

MyBatis isn't free. The bugs that cost me the most time in the past year:

1. **`<foreach>` with an empty collection silently produces invalid SQL.** `WHERE id IN ()`
   is rejected by every database I care about. The `<if test="ids != null and !ids.isEmpty()">`
   guard is mandatory, not optional.

2. **`TypeHandler` registration order on Spring Boot 3.** If you register a handler in
   `@Configuration` and another via `@MappedTypes`, the auto-config order isn't what you
   think. I lost an afternoon to a `LocalDateTime` ↔ `TIMESTAMP` mismatch that only
   showed up in one specific service because it loaded its mapper before the global
   handler registered. Lesson: register all custom handlers in one place, ideally via
   `mybatis-spring-boot-autoconfigure` properties.

3. **`@MappedJdbcTypes(includeNullJdbcType = true)`** — without this, your custom handler
   silently doesn't fire for nullable columns and you get the default `Object` mapping.
   The default isn't always wrong, which makes this fun to debug.

4. **N+1 is your problem now.** Without an ORM session you don't get automatic eager-
   loading. The discipline is: write the join once in the mapper. If you find yourself
   iterating a collection and calling another mapper method per element, stop and
   rewrite the query.

## My rule for XML vs annotations

MyBatis lets you define mappers with `@Select` / `@Insert` annotations or in XML. The
team rule that's worked for us:

> XML for anything with three or more dynamic fragments. Annotations for everything else.

Three fragments is the threshold where the string concatenation in `@Select` starts
hurting more than the file-jumping cost of XML. Below that, annotations keep the SQL
next to the method that uses it, which is genuinely nicer for read.

## The dual-write problem with Elasticsearch

The hotel uses MySQL as the source of truth and Elasticsearch as a derived view for
fuzzy search and faceting. Keeping them in sync is the part of the system I've thought
hardest about, and it's also where I've made the worst mistakes.

What I tried first: `@PostPersist` hooks that called the indexer. This works until it
doesn't — a transaction rolls back, you've already pushed to ES, your search results lie
about reality.

What works in production: **transactional outbox + async indexer**. Every write to the
domain table also writes to an `outbox` table in the same transaction. A separate
worker tails the outbox and applies changes to ES, marking rows as published. If the
worker is down, indexing falls behind, but it's never *wrong*. If the transaction rolls
back, the outbox row rolls back with it.

The cost is that ES is eventually consistent with MySQL, usually a few seconds behind.
For a hotel search that's fine. For anything where users expect to see their write
reflected immediately, you'd hit that read against MySQL directly.

## What I'd tell my last-year self

- MyBatis isn't a "lesser" persistence layer. It's a different one, optimized for
  legibility of complex queries over ergonomics of CRUD.
- The friction is up front (set up `TypeHandler`s carefully, mind your dynamic SQL
  guards) and the payoff is in months three through twelve, when nobody is afraid to
  modify a query.
- Don't put dual-write logic in entity callbacks. Outbox is the only honest answer.

I came in skeptical of XML mappers. I left convinced that the question isn't *XML or
annotations* — it's *do you want to be honest about your SQL or hide from it*. For this
system, honesty was the better trade.
