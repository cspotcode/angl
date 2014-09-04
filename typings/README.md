We have TSD configured to place its typings into the `from-tsd` subdirectory.

Other typings that do not or cannot come from TSD are placed in the `other` subdirectory.

The `other` subdirectory should mimic the directory structure of `from-tsd` for clarify.

TSD creates `tsd.d.ts` to reference all the definitions it installs.  That file should
not be modified by hand.

`all.d.ts` references `tsd.d.ts` *and* all definitions in the `other` directory.  Your
`.ts` files should reference `all.d.ts`.

