---
title: "MyBatis `<foreach>` with an empty collection produces invalid SQL"
pubDate: 2026-05-12
tags: [java, mybatis, sql]
---

A classic. This mapper looks fine in code review:

```xml
<select id="findByIds" resultType="Booking">
  SELECT * FROM booking
  WHERE id IN
  <foreach collection="ids" item="id" open="(" separator="," close=")">
    #{id}
  </foreach>
</select>
```

Pass an empty list and MyBatis renders `WHERE id IN ()`. MySQL, PostgreSQL, and SQL
Server all reject this with a syntax error. You don't get a friendly "no rows" — you get
a 500.

Two ways to fix it. Pick one and apply it everywhere.

**Guard at the mapper level:**

```xml
<select id="findByIds" resultType="Booking">
  SELECT * FROM booking
  <if test="ids != null and !ids.isEmpty()">
    WHERE id IN
    <foreach collection="ids" item="id" open="(" separator="," close=")">
      #{id}
    </foreach>
  </if>
  <if test="ids == null or ids.isEmpty()">
    WHERE 1 = 0
  </if>
</select>
```

The `WHERE 1 = 0` branch makes the contract honest — empty input means no results, not
an exception.

**Or guard at the service layer:**

```java
public List<Booking> findByIds(List<Long> ids) {
    if (ids == null || ids.isEmpty()) return List.of();
    return mapper.findByIds(ids);
}
```

Both work. The mapper-level guard is safer if your mapper is called from multiple
services. The service-level guard is faster (you skip the database round-trip) and makes
the empty case explicit at the call site.

A small bonus: if you're using `@Param("ids") List<Long> ids` defaults, never let the
default be `null`. Default to `Collections.emptyList()` so every caller has the same
behavior, and the only way to skip the filter is to not pass the parameter at all.
