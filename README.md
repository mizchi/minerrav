# @mizchi/minerrav

View error location for minified & no-sourcemap javascript.

(for my personal use)

```
$ npx @mizchi/minerrav <minified javascript url> -p 101 -a 5
      if (0 === n.length) return;
      const e = n[0];
      return await t[e](
      /*====== ERROR_HERE: 4801-4814(4801) ======*/
      ...n.slice(1));
    } catch (t) {
      e.error(t);
```

## LICENSE

MIT