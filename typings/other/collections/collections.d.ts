declare module "collections" {
    
    /** 
     * Any collection of ordered values, for queues and stacks. 
     *  
     * A deque, our double-ended-queue, is a collection that supports 
     * `push(...values)`, `pop()`, `shift()`, and `unshift(...values)`. 
     * An `Array` is a prime example of a `Deque`, but `shift()` and 
     * `unshift(...values)` reposition every subsequent value within the array. 
     *  
     * The `Deque` collection is designed specifically to perform well for all four of 
     * these operations. 
     * A deque is backed by a circular buffer, which has nice properties for avoiding 
     * garbage collection when values are frequently added and removed. 
     * However, `swap(index, length, values)` and `splice(index, length, ...values`) do 
     * require repositioning every subsequent value in the circular buffer. 
     *  
     * A `List` collection also supports fast deque operations. 
     * Lists are backed by a doubly linked list with a head node. 
     * The linked list is part of the list's public interface and you can manipulate it 
     * directly, which makes it possible to perform very fast concatenation and splices 
     * at any position. 
     * However, frequently adding and removing values will effect garbage collector 
     * churn. 
     *  
     * 
     */
    interface Deque {
            // TODO interface contents?
    }
    
    /** 
     * Any collection that has no duplicate values. 
     *  
     * A set represents a collection of unique values. 
     * The methods intrinsic to a set are `add(value)` and `delete(value)`. 
     * Sets ignore attempts to add duplicate values. 
     * Sets share a wealth of special methods like `union(values)` and 
     * `intersection(values)`. 
     *  
     * See the interface of ECMAScript Harmony [simple maps and 
     * sets](http://wiki.ecmascript.org/doku.php?id=harmony:simple_maps_and_sets) 
     *  
     * 
     */
    interface Set {
            // TODO interface contents?
    }
    
    /** 
     * Any lookup table from keys to values. 
     *  
     * A map is the interface of a lookup table. 
     * The methods intrinsic to a map are `get(key)`, `set(key, value)`, `has(key)`, 
     * and `delete(key)`. 
     *  
     * All maps are iterable and reducible, but vary in one detail. 
     * The callback receives the value for each key, and unlike with an `Array`, the 
     * key takes the place of the index. 
     *  
     * ```js 
     * var map = Map({a: 10}); 
     *  
     * map.forEach(function (value, key) { 
     *     expect(key).toBe("a"); 
     *     expect(value).toBe(10); 
     * }) 
     *  
     * var iterator = map.iterate(); 
     * var iteration = iterator.next(); 
     * expect(iteration.value).toBe(10); 
     * expect(iteration.index).toBe("a"); 
     * ``` 
     *  
     * All maps can be identified by their `isMap` property. 
     *  
     * All maps are backed by an analogous set of key and value entries. 
     * The map implementation overrides the intrinsic operators for the internal 
     * `store` set — like `equals`, `compare`, and `hash` — to consider only the key in 
     * determining equivalence, order, and uniqueness for each entry, as applicable. 
     * All maps share most of their implementation through a `GenericMap` abstract 
     * collection. 
     *  
     * By virtue of implementation reuse, all maps are also observable. 
     * However, the observer implementation varies significantly between versions 1 and 
     * 2. 
     *  
     * See the interface of ECMAScript Harmony [simple maps and 
     * sets](http://wiki.ecmascript.org/doku.php?id=harmony:simple_maps_and_sets) 
     *  
     * 
     */
    interface Map {
            // TODO interface contents?
    }
    
    interface Collection<V> {
        // TODO
    }
    
}


declare module "collections/list" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * An ordered list of values.
     * 
     * A `List` is backed by a doubly linked list with a head node.
     * 
     * The list has a `head` property to an empty node.
     * The list begins with the `next` node from the `head`.
     * The last node of the list is the `prev` node from the `head`.
     * The `head` represents the node one past the end of the list and has no `value`.
     * 
     * Nodes can be manipulated directly.
     * Lists use a `Node(value)` property as their node constructor.
     * It supports `delete()`, `addBefore(node)`, and `addAfter(node)`.
     * Directly manipulating `next` and `prev` of a node allows for fast splicing.
     * 
     * Nodes can be reused to avoid garbage collector churn.
     * However, if you do not need to splice, a `Deque` may perform better than `List`.
     * 
     * Lists can be iterated.
     * The iterator will produce artificial indexes for each value.
     * 
     * Lists provide slow random access by index.
     * Methods that accept indexes to seek a position will count as they walk to the
     * sought node.
     * These methods will always accept a node instead to instantly traverse to a known
     * position.
     * 
     * Lists provide [range change listeners](range-changes), but at significant cost.
     * Making range changes observable on a list requires that for each change to the
     * list, it must scan back to the head of the list to determine the node’s index,
     * which obviates the principle advantage of using the linked list structure.
     * Also, direct manipulation of the nodes is not observable and will require manual
     * change dispatch.
     * 
     * 
     */
    class List<V> {
    
        
        constructor(values?, equals?, getDefault?);
        
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Adds values to the end of a collection.
         * 
         * For purposes of genericity, collections that have an intrinsic relative order
         * for their values, like a `SortedSet`, support the `push` method but do not
         * necessarily add the new values to the end of the collection.
         * 
         * As of version 1.1.0 and 2.0.1, `Heap` does not yet support `push` for multiple
         * values.
         * 
         * 
         */
        push(...values): any;
        
        /**
         * Removes a value from the end of a collection, and returns that value.
         * 
         * For a `SortedSet` and a `Heap`, this is equivalent to removing the maximum value
         * of the collection.
         * 
         * 
         */
        pop(): V;
        
        /**
         * Removes a value from the beginning of a collection, and returns that value.
         * 
         * For a `SortedSet`, this is equivalent to removing the minimum value of the
         * collection.
         * 
         * For `List` and `Deque`, this operation is very fast.
         * For an `Array`, this operation will require all subsequent values to be
         * shifted to the left to fill the void at index zero.
         * 
         * 
         */
        shift(): V;
        
        /**
         * Adds values to the beginning of a collection.
         * 
         * For purposes of genericity, collections that have an intrinsic relative order
         * for their values, like a `SortedSet`, support the `unshift` method but do
         * not necessarily add the new values to the beginning of the collection.
         * 
         * 
         */
        unshift(...values): any;
        
        /**
         * Returns the value at the beginning of a collection, the value that would be returned by `shift()`.
         * 
         * 
         */
        peek(): V;
        
        /**
         * Replaces the value at the beginning of a collection, the value that would be returned by `shift()`.
         * 
         * 
         */
        poke(value): any;
        
        /**
         * Whether an equivalent value exists in this collection.
         * 
         * This operation is very fast for sets because they are backed by a hash table.
         * The operation is fast for `SortedSet` and `SortedArraySet` by virtue of a binary
         * search.
         * 
         * To avoid confusion with the linear search available as `has(value, equals)` on
         * `Array`, `List`, and `Deque`, if you pass a second argument, this method will
         * throw an exception.
         * 
         * 
         */
        has(value): boolean;
        
        /**
         * Returns whether an equivalent value exists in this collection.
         * 
         * This is a slow operation that visits each value in the collection.
         * By default, the equality operator is `Object.equals`.
         * 
         * There is an analogous implementation provided by `Set`, `SortedSet`, and
         * `SortedArraySet`, but those collections have an intrisinc order and uniqueness,
         * so they do not support the second argument, `equals`.
         * This method is also distinct from the `has` method provided by maps.
         * 
         * For the purposes of the `has` method, an `Array` behaves like a `List`, even
         * though the `Array` implements `get` and `set` as if it were a `Map`.
         * 
         */
        has(value, equals?): boolean;
        
        /**
         * Retrieves the equivalent value from the collection.
         * 
         * This is a very fast operation for `Set`, `FastSet`, `LruSet`, and `LfuSet`,
         * which are backed by hash tables.
         * This is also fast for `SortedArray` and `SortedArraySet` by virtue of a binary
         * search, and `SortedSet`, which is backed by a [splay tree][SplayTree].
         * 
         * [SplayTree]: http://en.wikipedia.org/wiki/Splay_tree
         * 
         * 
         */
        get(value): V;
        
        /**
         * Retrieves the equivalent value from this collection.
         * 
         * This is a slow operation that visits each value in the collection.
         * By default, the equality operator is `Object.equals`.
         * 
         * Note that `Array` does not subscribe to this interpretation of the `get` method.
         * For the purposes of `get`, an array behaves like a map from indexes to the
         * values at those indexes.
         * 
         * 
         */
        get(value, equals?): V;
        
        /**
         * Adds a value to a collection.
         * 
         * Ignores the operation if the value already exists within a set.
         * Regardless of the collection, returns whether the value was in fact added to the
         * set.
         * 
         * Generic collection methods often invoke this method as `add(value, key)` or
         * `add(value, index)`, in which case these collections ignore the second argument.
         * The genericity of `add` allows generic methods like `addEach`, `filter`, and
         * `clone` to use the same treatment for sets and maps, where the key or index may
         * or may not be meaningful.
         * Consider the implementation of filter.
         * 
         * ```js
         * GenericCollection.prototype.filter = function (callback /*, thisp*&#47;) {
         *     var thisp = arguments[1];
         *     var result = this.constructClone();
         *     this.reduce(function (undefined, value, key, object, depth) {
         *         if (callback.call(thisp, value, key, object, depth)) {
         *             result.add(value, key);
         *         }
         *     }, void 0);
         *     return result;
         * };
         * ```
         * 
         * The result will have the same type as this collection, which may be a map or a
         * set for example, because each of these have a `constructClone()` method that
         * will return an instance of their own type.
         * If the collection is a set, the keys will be meaningless and ignored.
         * If the collection is a map, the resulting map will have the entries, both key
         * and value, of the original map, except those for do not pass the test.
         * 
         * 
         */
        add(value): any;
        
        /**
         * Deletes the first equivalent value. Returns whether the key was found and successfully deleted.
         * 
         * This is a very fast operation for `Set`, `LruSet`, and `FastSet` because they
         * are backed by hash tables.
         * This is a fast operation for `SortedSet` because it is backed by a splay tree,
         * fast for `SortedArray` and `SortedArraySet` beause they use a binary search,
         * and fast for `Heap` because it is backed by a binary search tree projected on an
         * array.
         * 
         * However, `delete(value)` for these collections does not support the
         * `delete(value, equals)` overload.
         * Providing a second argument to `delete` in these collections will throw an
         * error.
         * 
         * 
         */
        delete(value): any;
        
        /**
         * Seeks out and deletes an equivalent value. Returns whether the value was found and successfully deleted.
         * 
         * This is a slow operation because it involves a linear walk to find the
         * equivalent value.
         * For an array, the hole left by the deletion will be filled by shifting
         * subsequent values leftward.
         * 
         * By default, the eqality comparison is performed by `Object.equals`, with the
         * reference value first.
         * 
         * In versions 1.1.1 and 2.0.1, `delete` favors the last found value for lists, and
         * the first found value for arrays.
         * This behavior is inconsistent subject to change, pending discovery of whether
         * FIFO or LIFO semantics are more useful by default.
         * 
         * 
         */
        delete(value, equals?): any;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes every value equivalent to the given value from the collection.
         * 
         * *Introduced in version 1.2.1.*
         * 
         * For sets, this is equivalent to delete, but for lists, arrays, and sorted
         * arrays, may delete more than one value.
         * For lists and arrays, this involves a linear search, from the beginning,
         * splicing out each node as it is traversed.
         * 
         * For sorted arrays, there is a mode for the provided equals and the intrinsic
         * equals.
         * The provided equals falls back to the linear search provided by the underlying
         * array.
         * However, if deleteAll uses its intrinsic order and equivalence, it can guarantee
         * that all intrinsic values are within a range from the first to the last
         * equivalent value, so it can splice all equivalent values at once, using a binary
         * search to find the first equivalent value, and a linear search to find the last..
         * The method is not implemented on Deque or Heap since random manipulation of
         * internal content is out of scope for these collections.
         * 
         * 
         */
        deleteAll(value, equals?): any;
        
        /**
         * Returns an array of the values contained in the half-open interval [start, end), that is, including the start and excluding the end.
         * 
         * For `Array`, `List`, and `Deque`, both terms may be numeric positive or negative
         * indicies.
         * 
         * For a `List`, either term may be a node.
         * 
         * 
         */
        slice(start?, end?): Array<V>;
        
        /**
         * Replaces a length of values from a starting position with the given variadic values, and returns the values that were replaced as an array.
         * 
         * 
         */
        splice(start: number, length: number, ...values: Array<V>): Array<V>;
        
        /**
         * Replaces a length of values from a starting position with the given values.
         * 
         * Unlike `splice`, if the start index is beyond the length of an array, `swap`
         * will extend the array to the given start index, leaving holes between the old
         * length and the start index.
         * 
         * In version 2, `swap` no longer returns an array of the removed length of values,
         * which further distinguishes it from `splice`, making it less wasteful in some
         * cases.
         * 
         * 
         */
        swap(start: number, length: number, values?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Finds the first equivalent value.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the left of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `find`, which conflicts with the definition
         * of `find` provided by ECMAScript 6.
         * In version 2, this method is called `findValue` to eliminate the conflict.
         * 
         * 
         */
        find(value, equals?, start?): any;
        
        /**
         * Finds the first equivalent value.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the left of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `find`, which conflicts with the definition
         * of `find` provided by ECMAScript 6.
         * In version 2, this method is called `findValue` to eliminate the conflict.
         * 
         * 
         */
        findValue(value, equals?, start?): any;
        
        /**
         * Finds the last equivalent value, searching from the right.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the right of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `findLast`.
         * It has been renamed `findLastValue` in version 2 to avoid a conflict with
         * `find` as proposed for ECMAScript 6.
         * 
         * 
         */
        findLast(value, equals?, start?): any;
        
        /**
         * Finds the last equivalent value, searching from the right.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the right of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `findLast`.
         * It has been renamed `findLastValue` in version 2 to avoid a conflict with
         * `find` as proposed for ECMAScript 6.
         * 
         * 
         */
        findLastValue(value, equals?, start?): any;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns one, arbitrary value from this collection, or *undefined* if there are none.
         * 
         * 
         */
        one(): V;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Sorts a collection in place.
         * 
         * :warning: The default comparator for `sort` on `Array` is defined by the
         * JavaScript language specification and is almost never appropriate.
         * The left and right values are coerced to strings and compared lexicographically.
         * Consider using `Object.compare`.
         * For all other collections that implement `sort`, `Object.compare` is the
         * default.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * 
         */
        sort(compare?: (left: V, right: V) => number): any;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Reverses the order of this collection in place.
         * 
         * 
         */
        reverse(): any;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Compares two values and returns a number having the same relative value to zero.
         * 
         * Compare will return a number
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the right is more than the left
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * `Object.compare` delegates to `compare` methods of objects when they are
         * available, and returns *0* if neither the left or right object support
         * comparison.
         * 
         * When comparing numbers, `compare` returns the difference between the left and
         * right, which expresses both the direction and magnitude of the relative values.
         * If the magnitude of the difference is not meaningful, compare *should* return
         * only *Infinity*, *-Infinity*, or *0*, but there is a long established precedent
         * from C of returning *-1* and *1* instead.
         * 
         * Note that comparison is not sufficient to distinguish equality, since *0* can
         * mean that the values are incomparable.
         * 
         * The optional second argument is an alternate comparator to use on the content of
         * the left collection, and defaults to `Object.compare`.
         * 
         * 
         */
        compare(value, compare?): number;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * An internal utility of `List` coercing indexes to nodes.
         * 
         * Returns the `index` if it is a node.
         * Returns the `defaultReturn` if the index is not defined.
         * Otherwise, scans to the given index.
         * The index may be negative, in which case it will scan backward from the head
         * node.
         * 
         * 
         */
        scan(index, defaultReturn): any;
        
        /**
         * Adds a listener for when values are added or removed at any position.
         * 
         * Every change to an array, or any flat collection of values, can model any
         * content change as a values added or removed at a particular index.
         * 
         * Every method that changes an array can be implemented in terms of `splice(index,
         * length, ...values)`.
         * For example, every time you `set(index, value)` on an array, it can be modeled
         * as `splice(index, 1, value)`.
         * Every time you push a value onto an array, it can be modeled as `splice(length,
         * 0, value)`.
         * Every time you shift a value off an array, it cam be modeled as `splice(0, 1)`.
         * Each of these changes can be communicated with a single message, `(plus, minus,
         * index)`: the values removed after that index, the values that were added after
         * that index, and the index itself, in that order.
         * 
         * Range change listeners receive such messages synchronously, as the array
         * changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * The function receives the arguments, `(plus, minus, index)`.
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addRangeChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesRangeChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesRangeWillChange`.
         * If there is no `token`, the handler method would be either `handleRangeChange`
         * or `handleRangeWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Range + Change **or** WillChange
         * -   handleRange + Change **or** WillChange
         * -   call
         * 
         * The `collections/range-changes` module exports a range changes **mixin**.
         * The methods of `RangeChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the range changes.
         * 
         * To register a will-change listener, use
         * [addBeforeRangeChangeListener](add-before-range-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a range change listener provided by [addRangeChangeListener](add-range-change-listener).
         * 
         * 
         */
        removeRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Informs range change listeners that values were removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchRangeChange(plus, minus, index, beforeChange?): any;
        
        /**
         * Adds a listener for before values are added or removed at any position.
         * See [addRangeChangeListener](add-range-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Unregisters a range change listener provided by [addBeforeRangeChangeListener](add-before-range-change-listener) or [addRangeChangeListener](add-range-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Informs range change listeners that values will be removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchBeforeRangeChange(plus, minus, index): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
        /**
         * Makes changes observable for this collection.
         * 
         * Adding any kind of change listener to an object will call this method.
         * Various collections implement this method to activate internal change listeners
         * needed to propagate their own changes.
         * Particularly, the module `collections/listen/array-changes` installs this method
         * on the `Array` prototype.
         * 
         * Calling this method on an array will either swap its prototype with the
         * observable array prototype or patch observable methods on the instance.
         * These methods in turn translate all array changes into range changes (as all
         * changes can be modeled by a splice operation), map changes (as the array is a
         * map from index to value), and property changes (as every index is a property,
         * but also taking the `length` into account).
         * 
         * 
         */
        makeObservable(): any;
        
    }
    export = List;
}

declare module "collections/deque" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * An ordered collection of values with fast random access, push, pop, shift, and unshift, but slow to splice.
     * 
     * A double ended queue is backed by a circular buffer, which cuts down on garbage
     * collector churn.
     * As long as the queue is stable, meaning values are added and removed at roughtly
     * the same pace, the backing store will not create new objects.
     * The store itself is an object with numeric indexes, like an array.
     * The indexes of the deque are offset from the indexes within the circular buffer,
     * and values spill over from the end of the buffer back to the beginning.
     * As values are removed by way of shifting, it makes room for values by way of
     * pushing.
     * 
     * Deques have constants `maxCapacity` and `minCapacity`.
     * 
     * 
     */
    class Deque<V> {
    
        
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Adds values to the end of a collection.
         * 
         * For purposes of genericity, collections that have an intrinsic relative order
         * for their values, like a `SortedSet`, support the `push` method but do not
         * necessarily add the new values to the end of the collection.
         * 
         * As of version 1.1.0 and 2.0.1, `Heap` does not yet support `push` for multiple
         * values.
         * 
         * 
         */
        push(...values): any;
        
        /**
         * Removes a value from the end of a collection, and returns that value.
         * 
         * For a `SortedSet` and a `Heap`, this is equivalent to removing the maximum value
         * of the collection.
         * 
         * 
         */
        pop(): V;
        
        /**
         * Removes a value from the beginning of a collection, and returns that value.
         * 
         * For a `SortedSet`, this is equivalent to removing the minimum value of the
         * collection.
         * 
         * For `List` and `Deque`, this operation is very fast.
         * For an `Array`, this operation will require all subsequent values to be
         * shifted to the left to fill the void at index zero.
         * 
         * 
         */
        shift(): V;
        
        /**
         * Adds values to the beginning of a collection.
         * 
         * For purposes of genericity, collections that have an intrinsic relative order
         * for their values, like a `SortedSet`, support the `unshift` method but do
         * not necessarily add the new values to the beginning of the collection.
         * 
         * 
         */
        unshift(...values): any;
        
        /**
         * Returns the value at the beginning of a collection, the value that would be returned by `shift()`.
         * 
         * 
         */
        peek(): V;
        
        /**
         * Replaces the value at the beginning of a collection, the value that would be returned by `shift()`.
         * 
         * 
         */
        poke(value): any;
        
        /**
         * Returns the value at the end of a collection, the value that would be returned by `pop()`.
         * 
         * 
         */
        peekBack(): V;
        
        /**
         * Replaces the value at the end of a collection, the value that would be returned by `pop()`.
         * 
         * 
         */
        pokeBack(value): any;
        
        /**
         * Whether an equivalent value exists in this collection.
         * 
         * This operation is very fast for sets because they are backed by a hash table.
         * The operation is fast for `SortedSet` and `SortedArraySet` by virtue of a binary
         * search.
         * 
         * To avoid confusion with the linear search available as `has(value, equals)` on
         * `Array`, `List`, and `Deque`, if you pass a second argument, this method will
         * throw an exception.
         * 
         * 
         */
        has(value): boolean;
        
        /**
         * Returns whether an equivalent value exists in this collection.
         * 
         * This is a slow operation that visits each value in the collection.
         * By default, the equality operator is `Object.equals`.
         * 
         * There is an analogous implementation provided by `Set`, `SortedSet`, and
         * `SortedArraySet`, but those collections have an intrisinc order and uniqueness,
         * so they do not support the second argument, `equals`.
         * This method is also distinct from the `has` method provided by maps.
         * 
         * For the purposes of the `has` method, an `Array` behaves like a `List`, even
         * though the `Array` implements `get` and `set` as if it were a `Map`.
         * 
         */
        has(value, equals?): boolean;
        
        /**
         * Retrieves the equivalent value from the collection.
         * 
         * This is a very fast operation for `Set`, `FastSet`, `LruSet`, and `LfuSet`,
         * which are backed by hash tables.
         * This is also fast for `SortedArray` and `SortedArraySet` by virtue of a binary
         * search, and `SortedSet`, which is backed by a [splay tree][SplayTree].
         * 
         * [SplayTree]: http://en.wikipedia.org/wiki/Splay_tree
         * 
         * 
         */
        get(value): V;
        
        /**
         * Retrieves the equivalent value from this collection.
         * 
         * This is a slow operation that visits each value in the collection.
         * By default, the equality operator is `Object.equals`.
         * 
         * Note that `Array` does not subscribe to this interpretation of the `get` method.
         * For the purposes of `get`, an array behaves like a map from indexes to the
         * values at those indexes.
         * 
         * 
         */
        get(value, equals?): V;
        
        /**
         * Adds a value to a collection.
         * 
         * Ignores the operation if the value already exists within a set.
         * Regardless of the collection, returns whether the value was in fact added to the
         * set.
         * 
         * Generic collection methods often invoke this method as `add(value, key)` or
         * `add(value, index)`, in which case these collections ignore the second argument.
         * The genericity of `add` allows generic methods like `addEach`, `filter`, and
         * `clone` to use the same treatment for sets and maps, where the key or index may
         * or may not be meaningful.
         * Consider the implementation of filter.
         * 
         * ```js
         * GenericCollection.prototype.filter = function (callback /*, thisp*&#47;) {
         *     var thisp = arguments[1];
         *     var result = this.constructClone();
         *     this.reduce(function (undefined, value, key, object, depth) {
         *         if (callback.call(thisp, value, key, object, depth)) {
         *             result.add(value, key);
         *         }
         *     }, void 0);
         *     return result;
         * };
         * ```
         * 
         * The result will have the same type as this collection, which may be a map or a
         * set for example, because each of these have a `constructClone()` method that
         * will return an instance of their own type.
         * If the collection is a set, the keys will be meaningless and ignored.
         * If the collection is a map, the resulting map will have the entries, both key
         * and value, of the original map, except those for do not pass the test.
         * 
         * 
         */
        add(value): any;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Returns the position of a value, or *-1* if the value is not found.
         * 
         * Returns the position of the first of equivalent values.
         * Equivalence is defined by the equality operator intrinsic to the collection,
         * either the one given as the `equals` argument to its constructor, or
         * `Object.equals` by default.
         * 
         * For a `SortedSet`, this operation is fast, because it is backed by a binary
         * search tree.
         * For a `SortedArray`, or `SortedArraySet`, this is also fast, employing a binary
         * search.
         * 
         * The implementation of `indexOf` for `Array`, `List`, and `Deque` is slower
         * but more flexible.
         * 
         * 
         */
        indexOf(value): number;
        
        /**
         * Returns the last position of a value, or *-1* if the value is not found.
         * 
         * Returns the position of the last of equivalent values.
         * Equivalence is defined by the equality operator intrinsic to the collection,
         * either the one given as the `equals` argument to its constructor, or
         * `Object.equals` by default.
         * 
         * For a `SortedSet`, this operation is fast, because it is backed by a binary
         * search tree.
         * For a `SortedArray`, or `SortedArraySet`, this is also fast, employing a binary
         * search.
         * 
         * The implementation of `indexOf` for `Array`, `List`, and `Deque` is slower
         * but more flexible.
         * 
         * 
         */
        lastIndexOf(value): number;
        
        /**
         * Returns the position of a value, or *-1* if the value is not found.
         * 
         * Returns the position of the first of equivalent values.
         * The second argument is an optional index from which to start seeking, and
         * defaults to 0, meaning search the entire collection.
         * 
         * For arrays, equivalence is defined by the `===` operator.
         * For all other collections, equivalence is defined by `contentEquals`, which
         * can be overridden with an argument to the collection’s constructor, or by
         * assigning a property to either the instance or prototype.
         * The default `contentEquals` is `Object.equals`, which performs a deep equality
         * comparison.
         * 
         * This method is slow, requiring a linear walk.
         * Fast implementations of `indexOf(value)` exist for `SortedSet`, `SortedArray`,
         * and `SortedArraySet`, but do not support a start index.
         * 
         * The precedent for the `indexOf` method is the JavaScript Array method, as
         * described on [MDN][].
         * 
         * [MDN]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
         * 
         * 
         */
        indexOf(value, start?): number;
        
        /**
         * Returns the last position of a value, or *-1* if the value is not found.
         * 
         * Returns the position of the last of equivalent values.  The second argument
         * is an optional index from which to start seeking, the upper bound of the
         * search, and defaults to *length - 1*, meaning search the entire collection.
         * 
         * For arrays, equivalence is defined by the `===` operator.
         * For all other collections, equivalence is defined by `contentEquals`, which
         * can be overridden with an argument to the collection’s constructor, or by
         * assigning a property to either the instance or prototype.
         * The default `contentEquals` is `Object.equals`, which performs a deep equality
         * comparison.
         * 
         * This method is slow, requiring a linear walk.
         * Fast implementations of `lastIndexOf(value)` exist for `SortedSet`, `SortedArray`,
         * and `SortedArraySet`, but do not support a start index.
         * 
         * The precedent for the `lastIndexOf` method is the JavaScript Array method, as
         * described on [MDN][].
         * 
         * [MDN]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf
         * 
         * 
         */
        lastIndexOf(value, start?): number;
        
        /**
         * Finds the first equivalent value.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the left of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `find`, which conflicts with the definition
         * of `find` provided by ECMAScript 6.
         * In version 2, this method is called `findValue` to eliminate the conflict.
         * 
         * 
         */
        find(value, equals?, start?): any;
        
        /**
         * Finds the first equivalent value.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the left of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `find`, which conflicts with the definition
         * of `find` provided by ECMAScript 6.
         * In version 2, this method is called `findValue` to eliminate the conflict.
         * 
         * 
         */
        findValue(value, equals?, start?): any;
        
        /**
         * Finds the last equivalent value, searching from the right.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the right of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `findLast`.
         * It has been renamed `findLastValue` in version 2 to avoid a conflict with
         * `find` as proposed for ECMAScript 6.
         * 
         * 
         */
        findLast(value, equals?, start?): any;
        
        /**
         * Finds the last equivalent value, searching from the right.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the right of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `findLast`.
         * It has been renamed `findLastValue` in version 2 to avoid a conflict with
         * `find` as proposed for ECMAScript 6.
         * 
         * 
         */
        findLastValue(value, equals?, start?): any;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns one, arbitrary value from this collection, or *undefined* if there are none.
         * 
         * 
         */
        one(): V;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Compares two values and returns a number having the same relative value to zero.
         * 
         * Compare will return a number
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the right is more than the left
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * `Object.compare` delegates to `compare` methods of objects when they are
         * available, and returns *0* if neither the left or right object support
         * comparison.
         * 
         * When comparing numbers, `compare` returns the difference between the left and
         * right, which expresses both the direction and magnitude of the relative values.
         * If the magnitude of the difference is not meaningful, compare *should* return
         * only *Infinity*, *-Infinity*, or *0*, but there is a long established precedent
         * from C of returning *-1* and *1* instead.
         * 
         * Note that comparison is not sufficient to distinguish equality, since *0* can
         * mean that the values are incomparable.
         * 
         * The optional second argument is an alternate comparator to use on the content of
         * the left collection, and defaults to `Object.compare`.
         * 
         * 
         */
        compare(value, compare?): number;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * An internal method of `Deque` that will grow the backing store if necessary.
         * 
         * 
         */
        ensureCapacity(capacity): any;
        
        /**
         * An implementation detail of a `Deque` that will increase the size of its backing store.
         */
        grow(capacity): any;
        
        /**
         * Adds a listener for when values are added or removed at any position.
         * 
         * Every change to an array, or any flat collection of values, can model any
         * content change as a values added or removed at a particular index.
         * 
         * Every method that changes an array can be implemented in terms of `splice(index,
         * length, ...values)`.
         * For example, every time you `set(index, value)` on an array, it can be modeled
         * as `splice(index, 1, value)`.
         * Every time you push a value onto an array, it can be modeled as `splice(length,
         * 0, value)`.
         * Every time you shift a value off an array, it cam be modeled as `splice(0, 1)`.
         * Each of these changes can be communicated with a single message, `(plus, minus,
         * index)`: the values removed after that index, the values that were added after
         * that index, and the index itself, in that order.
         * 
         * Range change listeners receive such messages synchronously, as the array
         * changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * The function receives the arguments, `(plus, minus, index)`.
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addRangeChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesRangeChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesRangeWillChange`.
         * If there is no `token`, the handler method would be either `handleRangeChange`
         * or `handleRangeWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Range + Change **or** WillChange
         * -   handleRange + Change **or** WillChange
         * -   call
         * 
         * The `collections/range-changes` module exports a range changes **mixin**.
         * The methods of `RangeChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the range changes.
         * 
         * To register a will-change listener, use
         * [addBeforeRangeChangeListener](add-before-range-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a range change listener provided by [addRangeChangeListener](add-range-change-listener).
         * 
         * 
         */
        removeRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Informs range change listeners that values were removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchRangeChange(plus, minus, index, beforeChange?): any;
        
        /**
         * Adds a listener for before values are added or removed at any position.
         * See [addRangeChangeListener](add-range-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Unregisters a range change listener provided by [addBeforeRangeChangeListener](add-before-range-change-listener) or [addRangeChangeListener](add-range-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Informs range change listeners that values will be removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchBeforeRangeChange(plus, minus, index): any;
        
    }
    export = Deque;
}

declare module "collections/map" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * A map of *[key, value]* entries, where keys may be arbitrary values including objects.
     * 
     * The optional `equals` and `hash` override the `contentEquals` and `contentHash`
     * properties that operate on the keys of the map to determine whether keys are
     * equivalent and where to store them.
     * 
     * The optional `getDefault` function overrides the map’s own `getDefault` method,
     * which is called by `get(key)` if no entry is found for the requested key.
     * 
     * A `Map` is backed by a `Set` of *[key, value]* entries, with `contentEquals` and
     * `contentHash` overridden to only consider the *key*.
     * 
     * 
     */
    class Map<K, V> {
    
        
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Returns whether an entry with the given key exists in a `Map`.
         * 
         * 
         */
        has(key): boolean;
        
        /**
         * Gets the value for a key in a map.
         * 
         * If there is no entry with the request key, and the user calls `get` with a
         * second argument *even if that argument is undefined*, the second argument will
         * be returned instead.
         * Otherwise, `get` will return the result of `getDefault(key)`, which itself
         * defaults to returning undefined.
         * 
         * Every map implementation gives an opportunity to override `getDefault` through
         * the constructor, but it can always be overridden on either the instance or the
         * prototype.
         * It is often useful to provide a `getDefault` that will create, save, and return
         * a default instance for a given key.
         * 
         * ```js
         * var users = new Dict();
         * users.getDefault = function (id) {
         *     var user = new User(id);
         *     this.set(id, user);
         *     return user;
         * };
         * ```
         * 
         * For the purposes of the `get` and `set` methods, an `Array` behaves like a map
         * from index to the value at that index.
         * 
         * ```js
         * var value = [1, 2, 3].get(1);
         * expect(value).toBe(2);
         * ```
         * 
         * In contrast, for the purposes of the `has` method, an `Array` behaves as a list
         * of values.
         * 
         * ```js
         * var found = [1, 2, 3].has(1);
         * expect(found).toBe(true);
         * ```
         * 
         * 
         */
        get(keyOrIndex, defaultReturn?): V;
        
        /**
         * Sets the value for a given key.
         * 
         * 
         */
        set(key, value): any;
        
        /**
         * Adds a value for a given key to a map.
         * 
         * This is an alias for `set(key, value)` that does not have an obvious reason to
         * exist.
         * The purpose of this method is to allow certain generic collection methods
         * including `addEach`, `filter`, and `clone`, to treat sets and maps in the same
         * fashion, without regard for whether the keys are or not meaningful for the
         * collection.
         * For example, sets implement `add(value)`, but maps implement `add(value, key)`.
         * Iterating a `List` provides meaningful indexes that can be used for keys if they
         * are converted to maps.
         * Consider this excerpt from `addEach(values)` for generic collections.
         * 
         * ```js
         * values.forEach(this.add, this);
         * ```
         * 
         * This copies values from an abitrary collection into this one.
         * Regardless of whether this collection is a map or a set, and whether the values
         * come from a map or a set, `add` is able to bridge the gap.
         * This is particularly important since `addEach(values)` is the last operation of
         * every collection constructor.
         * 
         * 
         */
        add(value, key): any;
        
        /**
         * Deletes the value for a given key. Returns whether the key was found and successfully deleted.
         * 
         * 
         */
        delete(key): any;
        
        /**
         * Returns an array of the keys of this map.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        keys(): Array<string>;
        
        /**
         * Returns an array of the values of this map.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        values(): Array<V>;
        
        /**
         * Returns an array of all *[key, value]* entries for this map.
         * 
         * Previous versions called this method `items()`.
         * This name has been deprecated in version 1, and removed in version 2.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        entries(): Array<Array<any>>;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * The `equals` function used to check whether values in this collection are equivalent.
         * 
         * 
         */
        contentEquals(left, right): any;
        
        /**
         * The `hash` function used by this collection to hash its own values.
         * 
         * 
         */
        contentHash(value): any;
        
        /**
         * Adds a listener for when the value for a key changes, or when entries are added or removed.
         * 
         * When the value for a key *changes*, maps will first dispatch a *map will change*
         * notification with the old value followed by a *map change* event with the new
         * value.
         * When a new entry gets *added* to a map, it will first dispatch a *map will
         * change* with undefined, followed by the *map change* with the initial value.
         * When an existing entry is *deleted* from a map, it will first dispatch a *map
         * will change* with the current value, followed by a *map change* with undefined.
         * 
         * As such, it is not possible to distinguish an undefined value from a
         * non-existant value, and it is not possible to capture both the new and old value
         * with a single listener.
         * These problems are addressed in version 2 with a new `observeMapChange`
         * interface.
         * 
         * Map change listeners receive such messages synchronously, as the map changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * A map change listener function `(value, key, map)`, the same argument pattern
         * familiar from iterator callbacks.
         * 
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addMapChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesMapChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesMapWillChange`.
         * If there is no `token`, the handler method would be either `handleMapChange`
         * or `handleMapWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Map + Change **or** WillChange
         * -   handleMap + Change **or** WillChange
         * -   call
         * 
         * The `collections/map-changes` module exports a map changes **mixin**.
         * The methods of `MapChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the map changes.
         * 
         * To register a will-change listener, use
         * [addBeforeMapChangeListener](add-before-map-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Adds a listener for before map entries are created, deleted, or updated.
         * See [addMapChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Unregisters a map change listener provided by [addMapChangeListener](add-map-change-listener).
         * 
         * 
         */
        removeMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a map change listener provided by [addBeforeMapChangeListener](add-before-map-change-listener) or [addMapChangeListener](add-map-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Informs map change listeners that an entry was created, deleted, or updated.
         * 
         * Collections that can dispatch map changes call this method to inform listeners.
         * 
         * 
         */
        dispatchMapChange(key, value, beforeChange?): any;
        
        /**
         * Informs map change listeners that an entry will be created, deleted, or updated.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         * 
         */
        dispatchBeforeMapChange(key, value): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
    }
    export = Map;
}

declare module "collections/set" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * A collection of unique values.
     * 
     * The constructor will add all of the values if any are given.
     * If the values are a map, the keys will be lost.
     * 
     * The optional `equals` and `hash` arguments override the set’s `contentEquals` and
     * `contentCompare` methods and determine where to store values and whether they
     * are equivalent.
     * 
     * The optional `getDefault` argument overrides the set’s `getDefault(value)`
     * method, which will be called by `get` if it cannot find an equivalent value
     * within the set.
     * 
     * The purpose of `get` is less obvious on a `Set` than a `Map`, since you would
     * not often need to find a value you already have.
     * However, by virtue of overriding `contentEquals` and `contentHash`, it is
     * possible to search for a value using an “equivalent” place-holder.
     * This is how maps use sets to find *[key, value]* entries when they only know the
     * *key*.
     * 
     * A `Set` is backed by a `FastSet` and a `List`.
     * The `List` is called `order` and tracks the iteration order of the `Set`.
     * Values are produced in the order they were first inserted.
     * The `FastSet` is called `store` and ensures uniqueness and very fast searches.
     * The `FastSet` stores nodes form the `order` list but hashes and compares them by
     * their `value` property.
     * 
     * The `Store` and `Order` constructors can be overridden by inheritors.
     * 
     * 
     */
    class Set<V> {
    
        
        constructor(values?, equals?, hash?, getDefault?);
        
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Removes a value from the end of a collection, and returns that value.
         * 
         * For a `SortedSet` and a `Heap`, this is equivalent to removing the maximum value
         * of the collection.
         * 
         * 
         */
        pop(): V;
        
        /**
         * Removes a value from the beginning of a collection, and returns that value.
         * 
         * For a `SortedSet`, this is equivalent to removing the minimum value of the
         * collection.
         * 
         * For `List` and `Deque`, this operation is very fast.
         * For an `Array`, this operation will require all subsequent values to be
         * shifted to the left to fill the void at index zero.
         * 
         * 
         */
        shift(): V;
        
        /**
         * Returns the set of values including all values from both of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        union(values): any;
        
        /**
         * Returns the set of values that are in both of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        intersection(values): any;
        
        /**
         * Returns the set of values that are in this set, excluding the values that are also in the other set.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        difference(values): any;
        
        /**
         * Returns the set of values that are only in one of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        symmetricDifference(values): any;
        
        /**
         * Whether an equivalent value exists in this collection.
         * 
         * This operation is very fast for sets because they are backed by a hash table.
         * The operation is fast for `SortedSet` and `SortedArraySet` by virtue of a binary
         * search.
         * 
         * To avoid confusion with the linear search available as `has(value, equals)` on
         * `Array`, `List`, and `Deque`, if you pass a second argument, this method will
         * throw an exception.
         * 
         * 
         */
        has(value): boolean;
        
        /**
         * Retrieves the equivalent value from the collection.
         * 
         * This is a very fast operation for `Set`, `FastSet`, `LruSet`, and `LfuSet`,
         * which are backed by hash tables.
         * This is also fast for `SortedArray` and `SortedArraySet` by virtue of a binary
         * search, and `SortedSet`, which is backed by a [splay tree][SplayTree].
         * 
         * [SplayTree]: http://en.wikipedia.org/wiki/Splay_tree
         * 
         * 
         */
        get(value): V;
        
        /**
         * Adds a value to a collection.
         * 
         * Ignores the operation if the value already exists within a set.
         * Regardless of the collection, returns whether the value was in fact added to the
         * set.
         * 
         * Generic collection methods often invoke this method as `add(value, key)` or
         * `add(value, index)`, in which case these collections ignore the second argument.
         * The genericity of `add` allows generic methods like `addEach`, `filter`, and
         * `clone` to use the same treatment for sets and maps, where the key or index may
         * or may not be meaningful.
         * Consider the implementation of filter.
         * 
         * ```js
         * GenericCollection.prototype.filter = function (callback /*, thisp*&#47;) {
         *     var thisp = arguments[1];
         *     var result = this.constructClone();
         *     this.reduce(function (undefined, value, key, object, depth) {
         *         if (callback.call(thisp, value, key, object, depth)) {
         *             result.add(value, key);
         *         }
         *     }, void 0);
         *     return result;
         * };
         * ```
         * 
         * The result will have the same type as this collection, which may be a map or a
         * set for example, because each of these have a `constructClone()` method that
         * will return an instance of their own type.
         * If the collection is a set, the keys will be meaningless and ignored.
         * If the collection is a map, the resulting map will have the entries, both key
         * and value, of the original map, except those for do not pass the test.
         * 
         * 
         */
        add(value): any;
        
        /**
         * Deletes the first equivalent value. Returns whether the key was found and successfully deleted.
         * 
         * This is a very fast operation for `Set`, `LruSet`, and `FastSet` because they
         * are backed by hash tables.
         * This is a fast operation for `SortedSet` because it is backed by a splay tree,
         * fast for `SortedArray` and `SortedArraySet` beause they use a binary search,
         * and fast for `Heap` because it is backed by a binary search tree projected on an
         * array.
         * 
         * However, `delete(value)` for these collections does not support the
         * `delete(value, equals)` overload.
         * Providing a second argument to `delete` in these collections will throw an
         * error.
         * 
         * 
         */
        delete(value): any;
        
        /**
         * An alias for `delete(value)` on sets that increases the overlap with the W3C `DOMTokenList` interface, implemented by `classList`.
         * 
         * 
         */
        remove(value): any;
        
        /**
         * An alias for `has(value)` on sets that increases the overlap with the W3C `DOMTokenList` interface, implemented by `classList`.
         * 
         * 
         */
        contains(value): boolean;
        
        /**
         * Toggles the existence of a value in a set.
         * 
         * If the value exists, deletes it.
         * if the value does not exist, adds it.
         * 
         * 
         */
        toggle(value: V): any;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes every value equivalent to the given value from the collection.
         * 
         * *Introduced in version 1.2.1.*
         * 
         * For sets, this is equivalent to delete, but for lists, arrays, and sorted
         * arrays, may delete more than one value.
         * For lists and arrays, this involves a linear search, from the beginning,
         * splicing out each node as it is traversed.
         * 
         * For sorted arrays, there is a mode for the provided equals and the intrinsic
         * equals.
         * The provided equals falls back to the linear search provided by the underlying
         * array.
         * However, if deleteAll uses its intrinsic order and equivalence, it can guarantee
         * that all intrinsic values are within a range from the first to the last
         * equivalent value, so it can splice all equivalent values at once, using a binary
         * search to find the first equivalent value, and a linear search to find the last..
         * The method is not implemented on Deque or Heap since random manipulation of
         * internal content is out of scope for these collections.
         * 
         * 
         */
        deleteAll(value, equals?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns one, arbitrary value from this collection, or *undefined* if there are none.
         * 
         * 
         */
        one(): V;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * The `equals` function used to check whether values in this collection are equivalent.
         * 
         * 
         */
        contentEquals(left, right): any;
        
        /**
         * The `hash` function used by this collection to hash its own values.
         * 
         * 
         */
        contentHash(value): any;
        
        /**
         * Adds a listener for when values are added or removed at any position.
         * 
         * Every change to an array, or any flat collection of values, can model any
         * content change as a values added or removed at a particular index.
         * 
         * Every method that changes an array can be implemented in terms of `splice(index,
         * length, ...values)`.
         * For example, every time you `set(index, value)` on an array, it can be modeled
         * as `splice(index, 1, value)`.
         * Every time you push a value onto an array, it can be modeled as `splice(length,
         * 0, value)`.
         * Every time you shift a value off an array, it cam be modeled as `splice(0, 1)`.
         * Each of these changes can be communicated with a single message, `(plus, minus,
         * index)`: the values removed after that index, the values that were added after
         * that index, and the index itself, in that order.
         * 
         * Range change listeners receive such messages synchronously, as the array
         * changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * The function receives the arguments, `(plus, minus, index)`.
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addRangeChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesRangeChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesRangeWillChange`.
         * If there is no `token`, the handler method would be either `handleRangeChange`
         * or `handleRangeWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Range + Change **or** WillChange
         * -   handleRange + Change **or** WillChange
         * -   call
         * 
         * The `collections/range-changes` module exports a range changes **mixin**.
         * The methods of `RangeChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the range changes.
         * 
         * To register a will-change listener, use
         * [addBeforeRangeChangeListener](add-before-range-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a range change listener provided by [addRangeChangeListener](add-range-change-listener).
         * 
         * 
         */
        removeRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Informs range change listeners that values were removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchRangeChange(plus, minus, index, beforeChange?): any;
        
        /**
         * Adds a listener for before values are added or removed at any position.
         * See [addRangeChangeListener](add-range-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Unregisters a range change listener provided by [addBeforeRangeChangeListener](add-before-range-change-listener) or [addRangeChangeListener](add-range-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Informs range change listeners that values will be removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchBeforeRangeChange(plus, minus, index): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
        /**
         * Makes changes observable for this collection.
         * 
         * Adding any kind of change listener to an object will call this method.
         * Various collections implement this method to activate internal change listeners
         * needed to propagate their own changes.
         * Particularly, the module `collections/listen/array-changes` installs this method
         * on the `Array` prototype.
         * 
         * Calling this method on an array will either swap its prototype with the
         * observable array prototype or patch observable methods on the instance.
         * These methods in turn translate all array changes into range changes (as all
         * changes can be modeled by a splice operation), map changes (as the array is a
         * map from index to value), and property changes (as every index is a property,
         * but also taking the `length` into account).
         * 
         * 
         */
        makeObservable(): any;
        
    }
    export = Set;
}

declare module "collections/heap" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * A collection of values with the largest always on top.
     * 
     * A heap is a binary tree where each node is greater than both its leaves.
     * The tree itself is complete or nearly complete at all times, so the heap is
     * backed by a compact array.
     * When values are added or removed, the tree rotates until the value has sunk
     * until its parent is greater, or floated until all children are less.
     * 
     * Values are presumed to not change in relative position without first being
     * removed, and perhaps added back, or adjusted after mutation using `sink(index)`
     * or `float(index)`.
     * 
     * 
     */
    class Heap<V> {
    
        
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Adds values to the end of a collection.
         * 
         * For purposes of genericity, collections that have an intrinsic relative order
         * for their values, like a `SortedSet`, support the `push` method but do not
         * necessarily add the new values to the end of the collection.
         * 
         * As of version 1.1.0 and 2.0.1, `Heap` does not yet support `push` for multiple
         * values.
         * 
         * 
         */
        push(...values): any;
        
        /**
         * Removes a value from the end of a collection, and returns that value.
         * 
         * For a `SortedSet` and a `Heap`, this is equivalent to removing the maximum value
         * of the collection.
         * 
         * 
         */
        pop(): V;
        
        /**
         * Returns the value at the beginning of a collection, the value that would be returned by `shift()`.
         * 
         * 
         */
        peek(): V;
        
        /**
         * Deletes the first equivalent value. Returns whether the key was found and successfully deleted.
         * 
         * This is a very fast operation for `Set`, `LruSet`, and `FastSet` because they
         * are backed by hash tables.
         * This is a fast operation for `SortedSet` because it is backed by a splay tree,
         * fast for `SortedArray` and `SortedArraySet` beause they use a binary search,
         * and fast for `Heap` because it is backed by a binary search tree projected on an
         * array.
         * 
         * However, `delete(value)` for these collections does not support the
         * `delete(value, equals)` overload.
         * Providing a second argument to `delete` in these collections will throw an
         * error.
         * 
         * 
         */
        delete(value): any;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Returns the position of a value, or *-1* if the value is not found.
         * 
         * Returns the position of the first of equivalent values.
         * Equivalence is defined by the equality operator intrinsic to the collection,
         * either the one given as the `equals` argument to its constructor, or
         * `Object.equals` by default.
         * 
         * For a `SortedSet`, this operation is fast, because it is backed by a binary
         * search tree.
         * For a `SortedArray`, or `SortedArraySet`, this is also fast, employing a binary
         * search.
         * 
         * The implementation of `indexOf` for `Array`, `List`, and `Deque` is slower
         * but more flexible.
         * 
         * 
         */
        indexOf(value): number;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns one, arbitrary value from this collection, or *undefined* if there are none.
         * 
         * 
         */
        one(): V;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * The `compare` function used by this collection to determine how to order its own values.
         * 
         * 
         */
        contentCompare(left, right): any;
        
        /**
         * The `equals` function used to check whether values in this collection are equivalent.
         * 
         * 
         */
        contentEquals(left, right): any;
        
        /**
         * Adds a listener for when values are added or removed at any position.
         * 
         * Every change to an array, or any flat collection of values, can model any
         * content change as a values added or removed at a particular index.
         * 
         * Every method that changes an array can be implemented in terms of `splice(index,
         * length, ...values)`.
         * For example, every time you `set(index, value)` on an array, it can be modeled
         * as `splice(index, 1, value)`.
         * Every time you push a value onto an array, it can be modeled as `splice(length,
         * 0, value)`.
         * Every time you shift a value off an array, it cam be modeled as `splice(0, 1)`.
         * Each of these changes can be communicated with a single message, `(plus, minus,
         * index)`: the values removed after that index, the values that were added after
         * that index, and the index itself, in that order.
         * 
         * Range change listeners receive such messages synchronously, as the array
         * changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * The function receives the arguments, `(plus, minus, index)`.
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addRangeChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesRangeChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesRangeWillChange`.
         * If there is no `token`, the handler method would be either `handleRangeChange`
         * or `handleRangeWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Range + Change **or** WillChange
         * -   handleRange + Change **or** WillChange
         * -   call
         * 
         * The `collections/range-changes` module exports a range changes **mixin**.
         * The methods of `RangeChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the range changes.
         * 
         * To register a will-change listener, use
         * [addBeforeRangeChangeListener](add-before-range-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a range change listener provided by [addRangeChangeListener](add-range-change-listener).
         * 
         * 
         */
        removeRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Informs range change listeners that values were removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchRangeChange(plus, minus, index, beforeChange?): any;
        
        /**
         * Adds a listener for before values are added or removed at any position.
         * See [addRangeChangeListener](add-range-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Unregisters a range change listener provided by [addBeforeRangeChangeListener](add-before-range-change-listener) or [addRangeChangeListener](add-range-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Informs range change listeners that values will be removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchBeforeRangeChange(plus, minus, index): any;
        
        /**
         * Adds a listener for when the value for a key changes, or when entries are added or removed.
         * 
         * When the value for a key *changes*, maps will first dispatch a *map will change*
         * notification with the old value followed by a *map change* event with the new
         * value.
         * When a new entry gets *added* to a map, it will first dispatch a *map will
         * change* with undefined, followed by the *map change* with the initial value.
         * When an existing entry is *deleted* from a map, it will first dispatch a *map
         * will change* with the current value, followed by a *map change* with undefined.
         * 
         * As such, it is not possible to distinguish an undefined value from a
         * non-existant value, and it is not possible to capture both the new and old value
         * with a single listener.
         * These problems are addressed in version 2 with a new `observeMapChange`
         * interface.
         * 
         * Map change listeners receive such messages synchronously, as the map changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * A map change listener function `(value, key, map)`, the same argument pattern
         * familiar from iterator callbacks.
         * 
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addMapChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesMapChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesMapWillChange`.
         * If there is no `token`, the handler method would be either `handleMapChange`
         * or `handleMapWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Map + Change **or** WillChange
         * -   handleMap + Change **or** WillChange
         * -   call
         * 
         * The `collections/map-changes` module exports a map changes **mixin**.
         * The methods of `MapChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the map changes.
         * 
         * To register a will-change listener, use
         * [addBeforeMapChangeListener](add-before-map-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Adds a listener for before map entries are created, deleted, or updated.
         * See [addMapChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Unregisters a map change listener provided by [addMapChangeListener](add-map-change-listener).
         * 
         * 
         */
        removeMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a map change listener provided by [addBeforeMapChangeListener](add-before-map-change-listener) or [addMapChangeListener](add-map-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Informs map change listeners that an entry was created, deleted, or updated.
         * 
         * Collections that can dispatch map changes call this method to inform listeners.
         * 
         * 
         */
        dispatchMapChange(key, value, beforeChange?): any;
        
        /**
         * Informs map change listeners that an entry will be created, deleted, or updated.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         * 
         */
        dispatchBeforeMapChange(key, value): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
    }
    export = Heap;
}

declare module "collections/dict" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * A mapping from string keys to values.
     * 
     * A dictionary is a specialized `map`.
     * The keys are required to be strings.
     * With this constraint in place, the mapping can make many simplifying assumptions
     * and use a plain JavaScript object as its backing store.
     * 
     * The optional first argument of the dictionary constructor is an object to copy
     * into the dictionary initially.
     * The value to copy may be...
     * 
     * -   An object literal
     * -   Any map-like collection with strings for keys
     * -   Any other kind of collection containing [key, value] pairs.
     * 
     * The optional second argument of the constructor is a `getDefault(key)` function.
     * This function will be called as a method of the dictionary if the value for a
     * given key does not exist when a user calls `get(key)`.
     * 
     * 
     */
    class Dict<V> {
    
        
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Returns whether an entry with the given key exists in a `Map`.
         * 
         * 
         */
        has(key): boolean;
        
        /**
         * Gets the value for a key in a map.
         * 
         * If there is no entry with the request key, and the user calls `get` with a
         * second argument *even if that argument is undefined*, the second argument will
         * be returned instead.
         * Otherwise, `get` will return the result of `getDefault(key)`, which itself
         * defaults to returning undefined.
         * 
         * Every map implementation gives an opportunity to override `getDefault` through
         * the constructor, but it can always be overridden on either the instance or the
         * prototype.
         * It is often useful to provide a `getDefault` that will create, save, and return
         * a default instance for a given key.
         * 
         * ```js
         * var users = new Dict();
         * users.getDefault = function (id) {
         *     var user = new User(id);
         *     this.set(id, user);
         *     return user;
         * };
         * ```
         * 
         * For the purposes of the `get` and `set` methods, an `Array` behaves like a map
         * from index to the value at that index.
         * 
         * ```js
         * var value = [1, 2, 3].get(1);
         * expect(value).toBe(2);
         * ```
         * 
         * In contrast, for the purposes of the `has` method, an `Array` behaves as a list
         * of values.
         * 
         * ```js
         * var found = [1, 2, 3].has(1);
         * expect(found).toBe(true);
         * ```
         * 
         * 
         */
        get(keyOrIndex, defaultReturn?): V;
        
        /**
         * Sets the value for a given key.
         * 
         * 
         */
        set(key, value): any;
        
        /**
         * Adds a value for a given key to a map.
         * 
         * This is an alias for `set(key, value)` that does not have an obvious reason to
         * exist.
         * The purpose of this method is to allow certain generic collection methods
         * including `addEach`, `filter`, and `clone`, to treat sets and maps in the same
         * fashion, without regard for whether the keys are or not meaningful for the
         * collection.
         * For example, sets implement `add(value)`, but maps implement `add(value, key)`.
         * Iterating a `List` provides meaningful indexes that can be used for keys if they
         * are converted to maps.
         * Consider this excerpt from `addEach(values)` for generic collections.
         * 
         * ```js
         * values.forEach(this.add, this);
         * ```
         * 
         * This copies values from an abitrary collection into this one.
         * Regardless of whether this collection is a map or a set, and whether the values
         * come from a map or a set, `add` is able to bridge the gap.
         * This is particularly important since `addEach(values)` is the last operation of
         * every collection constructor.
         * 
         * 
         */
        add(value, key): any;
        
        /**
         * Deletes the value for a given key. Returns whether the key was found and successfully deleted.
         * 
         * 
         */
        delete(key): any;
        
        /**
         * Returns an array of the keys of this map.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        keys(): Array<string>;
        
        /**
         * Returns an array of the values of this map.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        values(): Array<V>;
        
        /**
         * Returns an array of all *[key, value]* entries for this map.
         * 
         * Previous versions called this method `items()`.
         * This name has been deprecated in version 1, and removed in version 2.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        entries(): Array<Array<any>>;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns one, arbitrary value from this collection, or *undefined* if there are none.
         * 
         * 
         */
        one(): V;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * Adds a listener for when the value for a key changes, or when entries are added or removed.
         * 
         * When the value for a key *changes*, maps will first dispatch a *map will change*
         * notification with the old value followed by a *map change* event with the new
         * value.
         * When a new entry gets *added* to a map, it will first dispatch a *map will
         * change* with undefined, followed by the *map change* with the initial value.
         * When an existing entry is *deleted* from a map, it will first dispatch a *map
         * will change* with the current value, followed by a *map change* with undefined.
         * 
         * As such, it is not possible to distinguish an undefined value from a
         * non-existant value, and it is not possible to capture both the new and old value
         * with a single listener.
         * These problems are addressed in version 2 with a new `observeMapChange`
         * interface.
         * 
         * Map change listeners receive such messages synchronously, as the map changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * A map change listener function `(value, key, map)`, the same argument pattern
         * familiar from iterator callbacks.
         * 
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addMapChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesMapChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesMapWillChange`.
         * If there is no `token`, the handler method would be either `handleMapChange`
         * or `handleMapWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Map + Change **or** WillChange
         * -   handleMap + Change **or** WillChange
         * -   call
         * 
         * The `collections/map-changes` module exports a map changes **mixin**.
         * The methods of `MapChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the map changes.
         * 
         * To register a will-change listener, use
         * [addBeforeMapChangeListener](add-before-map-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Adds a listener for before map entries are created, deleted, or updated.
         * See [addMapChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Unregisters a map change listener provided by [addMapChangeListener](add-map-change-listener).
         * 
         * 
         */
        removeMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a map change listener provided by [addBeforeMapChangeListener](add-before-map-change-listener) or [addMapChangeListener](add-map-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Informs map change listeners that an entry was created, deleted, or updated.
         * 
         * Collections that can dispatch map changes call this method to inform listeners.
         * 
         * 
         */
        dispatchMapChange(key, value, beforeChange?): any;
        
        /**
         * Informs map change listeners that an entry will be created, deleted, or updated.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         * 
         */
        dispatchBeforeMapChange(key, value): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
    }
    export = Dict;
}

declare module "collections/sorted-array" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * A collection of values stored in stable stored order, backed by an array.
     * 
     * If the given values are an array, the `SortedArray` takes ownership of that
     * array and modifies it in place.
     * These changes can be observed.
     * 
     * `SortedArray` flies the `isSorted` flag.
     * 
     * 
     */
    class SortedArray<V> {
    
        
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Adds values to the end of a collection.
         * 
         * For purposes of genericity, collections that have an intrinsic relative order
         * for their values, like a `SortedSet`, support the `push` method but do not
         * necessarily add the new values to the end of the collection.
         * 
         * As of version 1.1.0 and 2.0.1, `Heap` does not yet support `push` for multiple
         * values.
         * 
         * 
         */
        push(...values): any;
        
        /**
         * Removes a value from the end of a collection, and returns that value.
         * 
         * For a `SortedSet` and a `Heap`, this is equivalent to removing the maximum value
         * of the collection.
         * 
         * 
         */
        pop(): V;
        
        /**
         * Removes a value from the beginning of a collection, and returns that value.
         * 
         * For a `SortedSet`, this is equivalent to removing the minimum value of the
         * collection.
         * 
         * For `List` and `Deque`, this operation is very fast.
         * For an `Array`, this operation will require all subsequent values to be
         * shifted to the left to fill the void at index zero.
         * 
         * 
         */
        shift(): V;
        
        /**
         * Adds values to the beginning of a collection.
         * 
         * For purposes of genericity, collections that have an intrinsic relative order
         * for their values, like a `SortedSet`, support the `unshift` method but do
         * not necessarily add the new values to the beginning of the collection.
         * 
         * 
         */
        unshift(...values): any;
        
        /**
         * Whether an equivalent value exists in this collection.
         * 
         * This operation is very fast for sets because they are backed by a hash table.
         * The operation is fast for `SortedSet` and `SortedArraySet` by virtue of a binary
         * search.
         * 
         * To avoid confusion with the linear search available as `has(value, equals)` on
         * `Array`, `List`, and `Deque`, if you pass a second argument, this method will
         * throw an exception.
         * 
         * 
         */
        has(value): boolean;
        
        /**
         * Retrieves the equivalent value from the collection.
         * 
         * This is a very fast operation for `Set`, `FastSet`, `LruSet`, and `LfuSet`,
         * which are backed by hash tables.
         * This is also fast for `SortedArray` and `SortedArraySet` by virtue of a binary
         * search, and `SortedSet`, which is backed by a [splay tree][SplayTree].
         * 
         * [SplayTree]: http://en.wikipedia.org/wiki/Splay_tree
         * 
         * 
         */
        get(value): V;
        
        /**
         * Adds a value to a collection.
         * 
         * Ignores the operation if the value already exists within a set.
         * Regardless of the collection, returns whether the value was in fact added to the
         * set.
         * 
         * Generic collection methods often invoke this method as `add(value, key)` or
         * `add(value, index)`, in which case these collections ignore the second argument.
         * The genericity of `add` allows generic methods like `addEach`, `filter`, and
         * `clone` to use the same treatment for sets and maps, where the key or index may
         * or may not be meaningful.
         * Consider the implementation of filter.
         * 
         * ```js
         * GenericCollection.prototype.filter = function (callback /*, thisp*&#47;) {
         *     var thisp = arguments[1];
         *     var result = this.constructClone();
         *     this.reduce(function (undefined, value, key, object, depth) {
         *         if (callback.call(thisp, value, key, object, depth)) {
         *             result.add(value, key);
         *         }
         *     }, void 0);
         *     return result;
         * };
         * ```
         * 
         * The result will have the same type as this collection, which may be a map or a
         * set for example, because each of these have a `constructClone()` method that
         * will return an instance of their own type.
         * If the collection is a set, the keys will be meaningless and ignored.
         * If the collection is a map, the resulting map will have the entries, both key
         * and value, of the original map, except those for do not pass the test.
         * 
         * 
         */
        add(value): any;
        
        /**
         * Deletes the first equivalent value. Returns whether the key was found and successfully deleted.
         * 
         * This is a very fast operation for `Set`, `LruSet`, and `FastSet` because they
         * are backed by hash tables.
         * This is a fast operation for `SortedSet` because it is backed by a splay tree,
         * fast for `SortedArray` and `SortedArraySet` beause they use a binary search,
         * and fast for `Heap` because it is backed by a binary search tree projected on an
         * array.
         * 
         * However, `delete(value)` for these collections does not support the
         * `delete(value, equals)` overload.
         * Providing a second argument to `delete` in these collections will throw an
         * error.
         * 
         * 
         */
        delete(value): any;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes every value equivalent to the given value from the collection.
         * 
         * *Introduced in version 1.2.1.*
         * 
         * For sets, this is equivalent to delete, but for lists, arrays, and sorted
         * arrays, may delete more than one value.
         * For lists and arrays, this involves a linear search, from the beginning,
         * splicing out each node as it is traversed.
         * 
         * For sorted arrays, there is a mode for the provided equals and the intrinsic
         * equals.
         * The provided equals falls back to the linear search provided by the underlying
         * array.
         * However, if deleteAll uses its intrinsic order and equivalence, it can guarantee
         * that all intrinsic values are within a range from the first to the last
         * equivalent value, so it can splice all equivalent values at once, using a binary
         * search to find the first equivalent value, and a linear search to find the last..
         * The method is not implemented on Deque or Heap since random manipulation of
         * internal content is out of scope for these collections.
         * 
         * 
         */
        deleteAll(value, equals?): any;
        
        /**
         * Returns an array of the values contained in the half-open interval [start, end), that is, including the start and excluding the end.
         * 
         * For `Array`, `List`, and `Deque`, both terms may be numeric positive or negative
         * indicies.
         * 
         * For a `List`, either term may be a node.
         * 
         * 
         */
        slice(start?, end?): Array<V>;
        
        /**
         * Replaces a length of values from a starting position with the given variadic values, and returns the values that were replaced as an array.
         * 
         * 
         */
        splice(start: number, length: number, ...values: Array<V>): Array<V>;
        
        /**
         * Replaces a length of values from a starting position with the given values.
         * 
         * Unlike `splice`, if the start index is beyond the length of an array, `swap`
         * will extend the array to the given start index, leaving holes between the old
         * length and the start index.
         * 
         * In version 2, `swap` no longer returns an array of the removed length of values,
         * which further distinguishes it from `splice`, making it less wasteful in some
         * cases.
         * 
         * 
         */
        swap(start: number, length: number, values?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Returns the position of a value, or *-1* if the value is not found.
         * 
         * Returns the position of the first of equivalent values.
         * Equivalence is defined by the equality operator intrinsic to the collection,
         * either the one given as the `equals` argument to its constructor, or
         * `Object.equals` by default.
         * 
         * For a `SortedSet`, this operation is fast, because it is backed by a binary
         * search tree.
         * For a `SortedArray`, or `SortedArraySet`, this is also fast, employing a binary
         * search.
         * 
         * The implementation of `indexOf` for `Array`, `List`, and `Deque` is slower
         * but more flexible.
         * 
         * 
         */
        indexOf(value): number;
        
        /**
         * Returns the last position of a value, or *-1* if the value is not found.
         * 
         * Returns the position of the last of equivalent values.
         * Equivalence is defined by the equality operator intrinsic to the collection,
         * either the one given as the `equals` argument to its constructor, or
         * `Object.equals` by default.
         * 
         * For a `SortedSet`, this operation is fast, because it is backed by a binary
         * search tree.
         * For a `SortedArray`, or `SortedArraySet`, this is also fast, employing a binary
         * search.
         * 
         * The implementation of `indexOf` for `Array`, `List`, and `Deque` is slower
         * but more flexible.
         * 
         * 
         */
        lastIndexOf(value): number;
        
        /**
         * Finds the first equivalent value.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the left of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `find`, which conflicts with the definition
         * of `find` provided by ECMAScript 6.
         * In version 2, this method is called `findValue` to eliminate the conflict.
         * 
         * 
         */
        find(value, equals?, start?): any;
        
        /**
         * Finds the first equivalent value.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the left of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `find`, which conflicts with the definition
         * of `find` provided by ECMAScript 6.
         * In version 2, this method is called `findValue` to eliminate the conflict.
         * 
         * 
         */
        findValue(value, equals?, start?): any;
        
        /**
         * Finds the last equivalent value, searching from the right.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the right of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `findLast`.
         * It has been renamed `findLastValue` in version 2 to avoid a conflict with
         * `find` as proposed for ECMAScript 6.
         * 
         * 
         */
        findLast(value, equals?, start?): any;
        
        /**
         * Finds the last equivalent value, searching from the right.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the right of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `findLast`.
         * It has been renamed `findLastValue` in version 2 to avoid a conflict with
         * `find` as proposed for ECMAScript 6.
         * 
         * 
         */
        findLastValue(value, equals?, start?): any;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns one, arbitrary value from this collection, or *undefined* if there are none.
         * 
         * 
         */
        one(): V;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Compares two values and returns a number having the same relative value to zero.
         * 
         * Compare will return a number
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the right is more than the left
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * `Object.compare` delegates to `compare` methods of objects when they are
         * available, and returns *0* if neither the left or right object support
         * comparison.
         * 
         * When comparing numbers, `compare` returns the difference between the left and
         * right, which expresses both the direction and magnitude of the relative values.
         * If the magnitude of the difference is not meaningful, compare *should* return
         * only *Infinity*, *-Infinity*, or *0*, but there is a long established precedent
         * from C of returning *-1* and *1* instead.
         * 
         * Note that comparison is not sufficient to distinguish equality, since *0* can
         * mean that the values are incomparable.
         * 
         * The optional second argument is an alternate comparator to use on the content of
         * the left collection, and defaults to `Object.compare`.
         * 
         * 
         */
        compare(value, compare?): number;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * The `compare` function used by this collection to determine how to order its own values.
         * 
         * 
         */
        contentCompare(left, right): any;
        
        /**
         * The `equals` function used to check whether values in this collection are equivalent.
         * 
         * 
         */
        contentEquals(left, right): any;
        
        /**
         * Adds a listener for when values are added or removed at any position.
         * 
         * Every change to an array, or any flat collection of values, can model any
         * content change as a values added or removed at a particular index.
         * 
         * Every method that changes an array can be implemented in terms of `splice(index,
         * length, ...values)`.
         * For example, every time you `set(index, value)` on an array, it can be modeled
         * as `splice(index, 1, value)`.
         * Every time you push a value onto an array, it can be modeled as `splice(length,
         * 0, value)`.
         * Every time you shift a value off an array, it cam be modeled as `splice(0, 1)`.
         * Each of these changes can be communicated with a single message, `(plus, minus,
         * index)`: the values removed after that index, the values that were added after
         * that index, and the index itself, in that order.
         * 
         * Range change listeners receive such messages synchronously, as the array
         * changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * The function receives the arguments, `(plus, minus, index)`.
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addRangeChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesRangeChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesRangeWillChange`.
         * If there is no `token`, the handler method would be either `handleRangeChange`
         * or `handleRangeWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Range + Change **or** WillChange
         * -   handleRange + Change **or** WillChange
         * -   call
         * 
         * The `collections/range-changes` module exports a range changes **mixin**.
         * The methods of `RangeChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the range changes.
         * 
         * To register a will-change listener, use
         * [addBeforeRangeChangeListener](add-before-range-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a range change listener provided by [addRangeChangeListener](add-range-change-listener).
         * 
         * 
         */
        removeRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Informs range change listeners that values were removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchRangeChange(plus, minus, index, beforeChange?): any;
        
        /**
         * Adds a listener for before values are added or removed at any position.
         * See [addRangeChangeListener](add-range-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Unregisters a range change listener provided by [addBeforeRangeChangeListener](add-before-range-change-listener) or [addRangeChangeListener](add-range-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Informs range change listeners that values will be removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchBeforeRangeChange(plus, minus, index): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
    }
    export = SortedArray;
}

declare module "collections/fast-set" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * The backing store for `Set` and `FastMap`.
     * 
     * A `FastSet` is a set of arbitrary values, including objects.
     * It is itself backed by a `Dict` of hash keys to a `List` of non-equivalent
     * values that share the same hash key.
     * The order of iteration is depth first through this structure, so not a faithful
     * emulation of a proper ECMAScript 6 `Set` if there are hash collisions.
     * 
     * 
     */
    class FastSet<V> {
    
        
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Returns the set of values including all values from both of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        union(values): any;
        
        /**
         * Returns the set of values that are in both of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        intersection(values): any;
        
        /**
         * Returns the set of values that are in this set, excluding the values that are also in the other set.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        difference(values): any;
        
        /**
         * Returns the set of values that are only in one of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        symmetricDifference(values): any;
        
        /**
         * Whether an equivalent value exists in this collection.
         * 
         * This operation is very fast for sets because they are backed by a hash table.
         * The operation is fast for `SortedSet` and `SortedArraySet` by virtue of a binary
         * search.
         * 
         * To avoid confusion with the linear search available as `has(value, equals)` on
         * `Array`, `List`, and `Deque`, if you pass a second argument, this method will
         * throw an exception.
         * 
         * 
         */
        has(value): boolean;
        
        /**
         * Retrieves the equivalent value from the collection.
         * 
         * This is a very fast operation for `Set`, `FastSet`, `LruSet`, and `LfuSet`,
         * which are backed by hash tables.
         * This is also fast for `SortedArray` and `SortedArraySet` by virtue of a binary
         * search, and `SortedSet`, which is backed by a [splay tree][SplayTree].
         * 
         * [SplayTree]: http://en.wikipedia.org/wiki/Splay_tree
         * 
         * 
         */
        get(value): V;
        
        /**
         * Adds a value to a collection.
         * 
         * Ignores the operation if the value already exists within a set.
         * Regardless of the collection, returns whether the value was in fact added to the
         * set.
         * 
         * Generic collection methods often invoke this method as `add(value, key)` or
         * `add(value, index)`, in which case these collections ignore the second argument.
         * The genericity of `add` allows generic methods like `addEach`, `filter`, and
         * `clone` to use the same treatment for sets and maps, where the key or index may
         * or may not be meaningful.
         * Consider the implementation of filter.
         * 
         * ```js
         * GenericCollection.prototype.filter = function (callback /*, thisp*&#47;) {
         *     var thisp = arguments[1];
         *     var result = this.constructClone();
         *     this.reduce(function (undefined, value, key, object, depth) {
         *         if (callback.call(thisp, value, key, object, depth)) {
         *             result.add(value, key);
         *         }
         *     }, void 0);
         *     return result;
         * };
         * ```
         * 
         * The result will have the same type as this collection, which may be a map or a
         * set for example, because each of these have a `constructClone()` method that
         * will return an instance of their own type.
         * If the collection is a set, the keys will be meaningless and ignored.
         * If the collection is a map, the resulting map will have the entries, both key
         * and value, of the original map, except those for do not pass the test.
         * 
         * 
         */
        add(value): any;
        
        /**
         * Deletes the first equivalent value. Returns whether the key was found and successfully deleted.
         * 
         * This is a very fast operation for `Set`, `LruSet`, and `FastSet` because they
         * are backed by hash tables.
         * This is a fast operation for `SortedSet` because it is backed by a splay tree,
         * fast for `SortedArray` and `SortedArraySet` beause they use a binary search,
         * and fast for `Heap` because it is backed by a binary search tree projected on an
         * array.
         * 
         * However, `delete(value)` for these collections does not support the
         * `delete(value, equals)` overload.
         * Providing a second argument to `delete` in these collections will throw an
         * error.
         * 
         * 
         */
        delete(value): any;
        
        /**
         * An alias for `delete(value)` on sets that increases the overlap with the W3C `DOMTokenList` interface, implemented by `classList`.
         * 
         * 
         */
        remove(value): any;
        
        /**
         * An alias for `has(value)` on sets that increases the overlap with the W3C `DOMTokenList` interface, implemented by `classList`.
         * 
         * 
         */
        contains(value): boolean;
        
        /**
         * Toggles the existence of a value in a set.
         * 
         * If the value exists, deletes it.
         * if the value does not exist, adds it.
         * 
         * 
         */
        toggle(value: V): any;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes every value equivalent to the given value from the collection.
         * 
         * *Introduced in version 1.2.1.*
         * 
         * For sets, this is equivalent to delete, but for lists, arrays, and sorted
         * arrays, may delete more than one value.
         * For lists and arrays, this involves a linear search, from the beginning,
         * splicing out each node as it is traversed.
         * 
         * For sorted arrays, there is a mode for the provided equals and the intrinsic
         * equals.
         * The provided equals falls back to the linear search provided by the underlying
         * array.
         * However, if deleteAll uses its intrinsic order and equivalence, it can guarantee
         * that all intrinsic values are within a range from the first to the last
         * equivalent value, so it can splice all equivalent values at once, using a binary
         * search to find the first equivalent value, and a linear search to find the last..
         * The method is not implemented on Deque or Heap since random manipulation of
         * internal content is out of scope for these collections.
         * 
         * 
         */
        deleteAll(value, equals?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns one, arbitrary value from this collection, or *undefined* if there are none.
         * 
         * 
         */
        one(): V;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * The `equals` function used to check whether values in this collection are equivalent.
         * 
         * 
         */
        contentEquals(left, right): any;
        
        /**
         * The `hash` function used by this collection to hash its own values.
         * 
         * 
         */
        contentHash(value): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
    }
    export = FastSet;
}

declare module "collections/lru-set" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * A set with a maximum capacity that will evict the least recently used value.
     * 
     * An `LruSet` is backed by a `Set` and uses the set’s own insertion order list to
     * track which value was least recently used.
     * 
     * 
     */
    class LruSet<V> {
    
        
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Returns the set of values including all values from both of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        union(values): any;
        
        /**
         * Returns the set of values that are in both of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        intersection(values): any;
        
        /**
         * Returns the set of values that are in this set, excluding the values that are also in the other set.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        difference(values): any;
        
        /**
         * Returns the set of values that are only in one of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        symmetricDifference(values): any;
        
        /**
         * Whether an equivalent value exists in this collection.
         * 
         * This operation is very fast for sets because they are backed by a hash table.
         * The operation is fast for `SortedSet` and `SortedArraySet` by virtue of a binary
         * search.
         * 
         * To avoid confusion with the linear search available as `has(value, equals)` on
         * `Array`, `List`, and `Deque`, if you pass a second argument, this method will
         * throw an exception.
         * 
         * 
         */
        has(value): boolean;
        
        /**
         * Retrieves the equivalent value from the collection.
         * 
         * This is a very fast operation for `Set`, `FastSet`, `LruSet`, and `LfuSet`,
         * which are backed by hash tables.
         * This is also fast for `SortedArray` and `SortedArraySet` by virtue of a binary
         * search, and `SortedSet`, which is backed by a [splay tree][SplayTree].
         * 
         * [SplayTree]: http://en.wikipedia.org/wiki/Splay_tree
         * 
         * 
         */
        get(value): V;
        
        /**
         * Adds a value to a collection.
         * 
         * Ignores the operation if the value already exists within a set.
         * Regardless of the collection, returns whether the value was in fact added to the
         * set.
         * 
         * Generic collection methods often invoke this method as `add(value, key)` or
         * `add(value, index)`, in which case these collections ignore the second argument.
         * The genericity of `add` allows generic methods like `addEach`, `filter`, and
         * `clone` to use the same treatment for sets and maps, where the key or index may
         * or may not be meaningful.
         * Consider the implementation of filter.
         * 
         * ```js
         * GenericCollection.prototype.filter = function (callback /*, thisp*&#47;) {
         *     var thisp = arguments[1];
         *     var result = this.constructClone();
         *     this.reduce(function (undefined, value, key, object, depth) {
         *         if (callback.call(thisp, value, key, object, depth)) {
         *             result.add(value, key);
         *         }
         *     }, void 0);
         *     return result;
         * };
         * ```
         * 
         * The result will have the same type as this collection, which may be a map or a
         * set for example, because each of these have a `constructClone()` method that
         * will return an instance of their own type.
         * If the collection is a set, the keys will be meaningless and ignored.
         * If the collection is a map, the resulting map will have the entries, both key
         * and value, of the original map, except those for do not pass the test.
         * 
         * 
         */
        add(value): any;
        
        /**
         * Deletes the first equivalent value. Returns whether the key was found and successfully deleted.
         * 
         * This is a very fast operation for `Set`, `LruSet`, and `FastSet` because they
         * are backed by hash tables.
         * This is a fast operation for `SortedSet` because it is backed by a splay tree,
         * fast for `SortedArray` and `SortedArraySet` beause they use a binary search,
         * and fast for `Heap` because it is backed by a binary search tree projected on an
         * array.
         * 
         * However, `delete(value)` for these collections does not support the
         * `delete(value, equals)` overload.
         * Providing a second argument to `delete` in these collections will throw an
         * error.
         * 
         * 
         */
        delete(value): any;
        
        /**
         * An alias for `delete(value)` on sets that increases the overlap with the W3C `DOMTokenList` interface, implemented by `classList`.
         * 
         * 
         */
        remove(value): any;
        
        /**
         * An alias for `has(value)` on sets that increases the overlap with the W3C `DOMTokenList` interface, implemented by `classList`.
         * 
         * 
         */
        contains(value): boolean;
        
        /**
         * Toggles the existence of a value in a set.
         * 
         * If the value exists, deletes it.
         * if the value does not exist, adds it.
         * 
         * 
         */
        toggle(value: V): any;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes every value equivalent to the given value from the collection.
         * 
         * *Introduced in version 1.2.1.*
         * 
         * For sets, this is equivalent to delete, but for lists, arrays, and sorted
         * arrays, may delete more than one value.
         * For lists and arrays, this involves a linear search, from the beginning,
         * splicing out each node as it is traversed.
         * 
         * For sorted arrays, there is a mode for the provided equals and the intrinsic
         * equals.
         * The provided equals falls back to the linear search provided by the underlying
         * array.
         * However, if deleteAll uses its intrinsic order and equivalence, it can guarantee
         * that all intrinsic values are within a range from the first to the last
         * equivalent value, so it can splice all equivalent values at once, using a binary
         * search to find the first equivalent value, and a linear search to find the last..
         * The method is not implemented on Deque or Heap since random manipulation of
         * internal content is out of scope for these collections.
         * 
         * 
         */
        deleteAll(value, equals?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns one, arbitrary value from this collection, or *undefined* if there are none.
         * 
         * 
         */
        one(): V;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * The `equals` function used to check whether values in this collection are equivalent.
         * 
         * 
         */
        contentEquals(left, right): any;
        
        /**
         * The `hash` function used by this collection to hash its own values.
         * 
         * 
         */
        contentHash(value): any;
        
        /**
         * Adds a listener for when values are added or removed at any position.
         * 
         * Every change to an array, or any flat collection of values, can model any
         * content change as a values added or removed at a particular index.
         * 
         * Every method that changes an array can be implemented in terms of `splice(index,
         * length, ...values)`.
         * For example, every time you `set(index, value)` on an array, it can be modeled
         * as `splice(index, 1, value)`.
         * Every time you push a value onto an array, it can be modeled as `splice(length,
         * 0, value)`.
         * Every time you shift a value off an array, it cam be modeled as `splice(0, 1)`.
         * Each of these changes can be communicated with a single message, `(plus, minus,
         * index)`: the values removed after that index, the values that were added after
         * that index, and the index itself, in that order.
         * 
         * Range change listeners receive such messages synchronously, as the array
         * changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * The function receives the arguments, `(plus, minus, index)`.
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addRangeChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesRangeChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesRangeWillChange`.
         * If there is no `token`, the handler method would be either `handleRangeChange`
         * or `handleRangeWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Range + Change **or** WillChange
         * -   handleRange + Change **or** WillChange
         * -   call
         * 
         * The `collections/range-changes` module exports a range changes **mixin**.
         * The methods of `RangeChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the range changes.
         * 
         * To register a will-change listener, use
         * [addBeforeRangeChangeListener](add-before-range-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a range change listener provided by [addRangeChangeListener](add-range-change-listener).
         * 
         * 
         */
        removeRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Informs range change listeners that values were removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchRangeChange(plus, minus, index, beforeChange?): any;
        
        /**
         * Adds a listener for before values are added or removed at any position.
         * See [addRangeChangeListener](add-range-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Unregisters a range change listener provided by [addBeforeRangeChangeListener](add-before-range-change-listener) or [addRangeChangeListener](add-range-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Informs range change listeners that values will be removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchBeforeRangeChange(plus, minus, index): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
    }
    export = LruSet;
}

declare module "collections/lfu-set" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * A set with a maximum capacity that will evict the least frequently used value.
     * 
     * An `LfuSet` is backed by a `Set` and a doubly linked list of `Set` instances for
     * each cohort of values by frequency of use.
     * 
     * 
     */
    class LfuSet<V> {
    
        
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Returns the set of values including all values from both of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        union(values): any;
        
        /**
         * Returns the set of values that are in both of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        intersection(values): any;
        
        /**
         * Returns the set of values that are in this set, excluding the values that are also in the other set.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        difference(values): any;
        
        /**
         * Returns the set of values that are only in one of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        symmetricDifference(values): any;
        
        /**
         * Whether an equivalent value exists in this collection.
         * 
         * This operation is very fast for sets because they are backed by a hash table.
         * The operation is fast for `SortedSet` and `SortedArraySet` by virtue of a binary
         * search.
         * 
         * To avoid confusion with the linear search available as `has(value, equals)` on
         * `Array`, `List`, and `Deque`, if you pass a second argument, this method will
         * throw an exception.
         * 
         * 
         */
        has(value): boolean;
        
        /**
         * Retrieves the equivalent value from the collection.
         * 
         * This is a very fast operation for `Set`, `FastSet`, `LruSet`, and `LfuSet`,
         * which are backed by hash tables.
         * This is also fast for `SortedArray` and `SortedArraySet` by virtue of a binary
         * search, and `SortedSet`, which is backed by a [splay tree][SplayTree].
         * 
         * [SplayTree]: http://en.wikipedia.org/wiki/Splay_tree
         * 
         * 
         */
        get(value): V;
        
        /**
         * Adds a value to a collection.
         * 
         * Ignores the operation if the value already exists within a set.
         * Regardless of the collection, returns whether the value was in fact added to the
         * set.
         * 
         * Generic collection methods often invoke this method as `add(value, key)` or
         * `add(value, index)`, in which case these collections ignore the second argument.
         * The genericity of `add` allows generic methods like `addEach`, `filter`, and
         * `clone` to use the same treatment for sets and maps, where the key or index may
         * or may not be meaningful.
         * Consider the implementation of filter.
         * 
         * ```js
         * GenericCollection.prototype.filter = function (callback /*, thisp*&#47;) {
         *     var thisp = arguments[1];
         *     var result = this.constructClone();
         *     this.reduce(function (undefined, value, key, object, depth) {
         *         if (callback.call(thisp, value, key, object, depth)) {
         *             result.add(value, key);
         *         }
         *     }, void 0);
         *     return result;
         * };
         * ```
         * 
         * The result will have the same type as this collection, which may be a map or a
         * set for example, because each of these have a `constructClone()` method that
         * will return an instance of their own type.
         * If the collection is a set, the keys will be meaningless and ignored.
         * If the collection is a map, the resulting map will have the entries, both key
         * and value, of the original map, except those for do not pass the test.
         * 
         * 
         */
        add(value): any;
        
        /**
         * Deletes the first equivalent value. Returns whether the key was found and successfully deleted.
         * 
         * This is a very fast operation for `Set`, `LruSet`, and `FastSet` because they
         * are backed by hash tables.
         * This is a fast operation for `SortedSet` because it is backed by a splay tree,
         * fast for `SortedArray` and `SortedArraySet` beause they use a binary search,
         * and fast for `Heap` because it is backed by a binary search tree projected on an
         * array.
         * 
         * However, `delete(value)` for these collections does not support the
         * `delete(value, equals)` overload.
         * Providing a second argument to `delete` in these collections will throw an
         * error.
         * 
         * 
         */
        delete(value): any;
        
        /**
         * An alias for `delete(value)` on sets that increases the overlap with the W3C `DOMTokenList` interface, implemented by `classList`.
         * 
         * 
         */
        remove(value): any;
        
        /**
         * An alias for `has(value)` on sets that increases the overlap with the W3C `DOMTokenList` interface, implemented by `classList`.
         * 
         * 
         */
        contains(value): boolean;
        
        /**
         * Toggles the existence of a value in a set.
         * 
         * If the value exists, deletes it.
         * if the value does not exist, adds it.
         * 
         * 
         */
        toggle(value: V): any;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes every value equivalent to the given value from the collection.
         * 
         * *Introduced in version 1.2.1.*
         * 
         * For sets, this is equivalent to delete, but for lists, arrays, and sorted
         * arrays, may delete more than one value.
         * For lists and arrays, this involves a linear search, from the beginning,
         * splicing out each node as it is traversed.
         * 
         * For sorted arrays, there is a mode for the provided equals and the intrinsic
         * equals.
         * The provided equals falls back to the linear search provided by the underlying
         * array.
         * However, if deleteAll uses its intrinsic order and equivalence, it can guarantee
         * that all intrinsic values are within a range from the first to the last
         * equivalent value, so it can splice all equivalent values at once, using a binary
         * search to find the first equivalent value, and a linear search to find the last..
         * The method is not implemented on Deque or Heap since random manipulation of
         * internal content is out of scope for these collections.
         * 
         * 
         */
        deleteAll(value, equals?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns one, arbitrary value from this collection, or *undefined* if there are none.
         * 
         * 
         */
        one(): V;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * The `equals` function used to check whether values in this collection are equivalent.
         * 
         * 
         */
        contentEquals(left, right): any;
        
        /**
         * The `hash` function used by this collection to hash its own values.
         * 
         * 
         */
        contentHash(value): any;
        
        /**
         * Adds a listener for when values are added or removed at any position.
         * 
         * Every change to an array, or any flat collection of values, can model any
         * content change as a values added or removed at a particular index.
         * 
         * Every method that changes an array can be implemented in terms of `splice(index,
         * length, ...values)`.
         * For example, every time you `set(index, value)` on an array, it can be modeled
         * as `splice(index, 1, value)`.
         * Every time you push a value onto an array, it can be modeled as `splice(length,
         * 0, value)`.
         * Every time you shift a value off an array, it cam be modeled as `splice(0, 1)`.
         * Each of these changes can be communicated with a single message, `(plus, minus,
         * index)`: the values removed after that index, the values that were added after
         * that index, and the index itself, in that order.
         * 
         * Range change listeners receive such messages synchronously, as the array
         * changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * The function receives the arguments, `(plus, minus, index)`.
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addRangeChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesRangeChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesRangeWillChange`.
         * If there is no `token`, the handler method would be either `handleRangeChange`
         * or `handleRangeWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Range + Change **or** WillChange
         * -   handleRange + Change **or** WillChange
         * -   call
         * 
         * The `collections/range-changes` module exports a range changes **mixin**.
         * The methods of `RangeChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the range changes.
         * 
         * To register a will-change listener, use
         * [addBeforeRangeChangeListener](add-before-range-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a range change listener provided by [addRangeChangeListener](add-range-change-listener).
         * 
         * 
         */
        removeRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Informs range change listeners that values were removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchRangeChange(plus, minus, index, beforeChange?): any;
        
        /**
         * Adds a listener for before values are added or removed at any position.
         * See [addRangeChangeListener](add-range-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Unregisters a range change listener provided by [addBeforeRangeChangeListener](add-before-range-change-listener) or [addRangeChangeListener](add-range-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Informs range change listeners that values will be removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchBeforeRangeChange(plus, minus, index): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
    }
    export = LfuSet;
}

declare module "collections/sorted-array-set" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * A collection of unique values stored in sorted order, backed by a plain array.
     * 
     * If the given values are an actual array, the `SortedArraySet` takes ownership of
     * that array and maintains its content.
     * The user can then observe that array for changes.
     * 
     * A sorted array sets performs better than a `SortedSet` when it has roughly less
     * than 100 values.
     * 
     * `SortedArraySet` instances fly the `isSorted` and `isSet` flags.
     * 
     * 
     */
    class SortedArraySet<V> {
    
        
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Adds values to the end of a collection.
         * 
         * For purposes of genericity, collections that have an intrinsic relative order
         * for their values, like a `SortedSet`, support the `push` method but do not
         * necessarily add the new values to the end of the collection.
         * 
         * As of version 1.1.0 and 2.0.1, `Heap` does not yet support `push` for multiple
         * values.
         * 
         * 
         */
        push(...values): any;
        
        /**
         * Removes a value from the end of a collection, and returns that value.
         * 
         * For a `SortedSet` and a `Heap`, this is equivalent to removing the maximum value
         * of the collection.
         * 
         * 
         */
        pop(): V;
        
        /**
         * Removes a value from the beginning of a collection, and returns that value.
         * 
         * For a `SortedSet`, this is equivalent to removing the minimum value of the
         * collection.
         * 
         * For `List` and `Deque`, this operation is very fast.
         * For an `Array`, this operation will require all subsequent values to be
         * shifted to the left to fill the void at index zero.
         * 
         * 
         */
        shift(): V;
        
        /**
         * Adds values to the beginning of a collection.
         * 
         * For purposes of genericity, collections that have an intrinsic relative order
         * for their values, like a `SortedSet`, support the `unshift` method but do
         * not necessarily add the new values to the beginning of the collection.
         * 
         * 
         */
        unshift(...values): any;
        
        /**
         * Returns the set of values including all values from both of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        union(values): any;
        
        /**
         * Returns the set of values that are in both of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        intersection(values): any;
        
        /**
         * Returns the set of values that are in this set, excluding the values that are also in the other set.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        difference(values): any;
        
        /**
         * Returns the set of values that are only in one of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        symmetricDifference(values): any;
        
        /**
         * Whether an equivalent value exists in this collection.
         * 
         * This operation is very fast for sets because they are backed by a hash table.
         * The operation is fast for `SortedSet` and `SortedArraySet` by virtue of a binary
         * search.
         * 
         * To avoid confusion with the linear search available as `has(value, equals)` on
         * `Array`, `List`, and `Deque`, if you pass a second argument, this method will
         * throw an exception.
         * 
         * 
         */
        has(value): boolean;
        
        /**
         * Retrieves the equivalent value from the collection.
         * 
         * This is a very fast operation for `Set`, `FastSet`, `LruSet`, and `LfuSet`,
         * which are backed by hash tables.
         * This is also fast for `SortedArray` and `SortedArraySet` by virtue of a binary
         * search, and `SortedSet`, which is backed by a [splay tree][SplayTree].
         * 
         * [SplayTree]: http://en.wikipedia.org/wiki/Splay_tree
         * 
         * 
         */
        get(value): V;
        
        /**
         * Adds a value to a collection.
         * 
         * Ignores the operation if the value already exists within a set.
         * Regardless of the collection, returns whether the value was in fact added to the
         * set.
         * 
         * Generic collection methods often invoke this method as `add(value, key)` or
         * `add(value, index)`, in which case these collections ignore the second argument.
         * The genericity of `add` allows generic methods like `addEach`, `filter`, and
         * `clone` to use the same treatment for sets and maps, where the key or index may
         * or may not be meaningful.
         * Consider the implementation of filter.
         * 
         * ```js
         * GenericCollection.prototype.filter = function (callback /*, thisp*&#47;) {
         *     var thisp = arguments[1];
         *     var result = this.constructClone();
         *     this.reduce(function (undefined, value, key, object, depth) {
         *         if (callback.call(thisp, value, key, object, depth)) {
         *             result.add(value, key);
         *         }
         *     }, void 0);
         *     return result;
         * };
         * ```
         * 
         * The result will have the same type as this collection, which may be a map or a
         * set for example, because each of these have a `constructClone()` method that
         * will return an instance of their own type.
         * If the collection is a set, the keys will be meaningless and ignored.
         * If the collection is a map, the resulting map will have the entries, both key
         * and value, of the original map, except those for do not pass the test.
         * 
         * 
         */
        add(value): any;
        
        /**
         * Deletes the first equivalent value. Returns whether the key was found and successfully deleted.
         * 
         * This is a very fast operation for `Set`, `LruSet`, and `FastSet` because they
         * are backed by hash tables.
         * This is a fast operation for `SortedSet` because it is backed by a splay tree,
         * fast for `SortedArray` and `SortedArraySet` beause they use a binary search,
         * and fast for `Heap` because it is backed by a binary search tree projected on an
         * array.
         * 
         * However, `delete(value)` for these collections does not support the
         * `delete(value, equals)` overload.
         * Providing a second argument to `delete` in these collections will throw an
         * error.
         * 
         * 
         */
        delete(value): any;
        
        /**
         * An alias for `delete(value)` on sets that increases the overlap with the W3C `DOMTokenList` interface, implemented by `classList`.
         * 
         * 
         */
        remove(value): any;
        
        /**
         * An alias for `has(value)` on sets that increases the overlap with the W3C `DOMTokenList` interface, implemented by `classList`.
         * 
         * 
         */
        contains(value): boolean;
        
        /**
         * Toggles the existence of a value in a set.
         * 
         * If the value exists, deletes it.
         * if the value does not exist, adds it.
         * 
         * 
         */
        toggle(value: V): any;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes every value equivalent to the given value from the collection.
         * 
         * *Introduced in version 1.2.1.*
         * 
         * For sets, this is equivalent to delete, but for lists, arrays, and sorted
         * arrays, may delete more than one value.
         * For lists and arrays, this involves a linear search, from the beginning,
         * splicing out each node as it is traversed.
         * 
         * For sorted arrays, there is a mode for the provided equals and the intrinsic
         * equals.
         * The provided equals falls back to the linear search provided by the underlying
         * array.
         * However, if deleteAll uses its intrinsic order and equivalence, it can guarantee
         * that all intrinsic values are within a range from the first to the last
         * equivalent value, so it can splice all equivalent values at once, using a binary
         * search to find the first equivalent value, and a linear search to find the last..
         * The method is not implemented on Deque or Heap since random manipulation of
         * internal content is out of scope for these collections.
         * 
         * 
         */
        deleteAll(value, equals?): any;
        
        /**
         * Returns an array of the values contained in the half-open interval [start, end), that is, including the start and excluding the end.
         * 
         * For `Array`, `List`, and `Deque`, both terms may be numeric positive or negative
         * indicies.
         * 
         * For a `List`, either term may be a node.
         * 
         * 
         */
        slice(start?, end?): Array<V>;
        
        /**
         * Replaces a length of values from a starting position with the given variadic values, and returns the values that were replaced as an array.
         * 
         * 
         */
        splice(start: number, length: number, ...values: Array<V>): Array<V>;
        
        /**
         * Replaces a length of values from a starting position with the given values.
         * 
         * Unlike `splice`, if the start index is beyond the length of an array, `swap`
         * will extend the array to the given start index, leaving holes between the old
         * length and the start index.
         * 
         * In version 2, `swap` no longer returns an array of the removed length of values,
         * which further distinguishes it from `splice`, making it less wasteful in some
         * cases.
         * 
         * 
         */
        swap(start: number, length: number, values?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Returns the position of a value, or *-1* if the value is not found.
         * 
         * Returns the position of the first of equivalent values.
         * Equivalence is defined by the equality operator intrinsic to the collection,
         * either the one given as the `equals` argument to its constructor, or
         * `Object.equals` by default.
         * 
         * For a `SortedSet`, this operation is fast, because it is backed by a binary
         * search tree.
         * For a `SortedArray`, or `SortedArraySet`, this is also fast, employing a binary
         * search.
         * 
         * The implementation of `indexOf` for `Array`, `List`, and `Deque` is slower
         * but more flexible.
         * 
         * 
         */
        indexOf(value): number;
        
        /**
         * Returns the last position of a value, or *-1* if the value is not found.
         * 
         * Returns the position of the last of equivalent values.
         * Equivalence is defined by the equality operator intrinsic to the collection,
         * either the one given as the `equals` argument to its constructor, or
         * `Object.equals` by default.
         * 
         * For a `SortedSet`, this operation is fast, because it is backed by a binary
         * search tree.
         * For a `SortedArray`, or `SortedArraySet`, this is also fast, employing a binary
         * search.
         * 
         * The implementation of `indexOf` for `Array`, `List`, and `Deque` is slower
         * but more flexible.
         * 
         * 
         */
        lastIndexOf(value): number;
        
        /**
         * Finds the first equivalent value.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the left of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `find`, which conflicts with the definition
         * of `find` provided by ECMAScript 6.
         * In version 2, this method is called `findValue` to eliminate the conflict.
         * 
         * 
         */
        find(value, equals?, start?): any;
        
        /**
         * Finds the first equivalent value.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the left of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `find`, which conflicts with the definition
         * of `find` provided by ECMAScript 6.
         * In version 2, this method is called `findValue` to eliminate the conflict.
         * 
         * 
         */
        findValue(value, equals?, start?): any;
        
        /**
         * Finds the last equivalent value, searching from the right.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the right of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `findLast`.
         * It has been renamed `findLastValue` in version 2 to avoid a conflict with
         * `find` as proposed for ECMAScript 6.
         * 
         * 
         */
        findLast(value, equals?, start?): any;
        
        /**
         * Finds the last equivalent value, searching from the right.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the right of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `findLast`.
         * It has been renamed `findLastValue` in version 2 to avoid a conflict with
         * `find` as proposed for ECMAScript 6.
         * 
         * 
         */
        findLastValue(value, equals?, start?): any;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns one, arbitrary value from this collection, or *undefined* if there are none.
         * 
         * 
         */
        one(): V;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Compares two values and returns a number having the same relative value to zero.
         * 
         * Compare will return a number
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the right is more than the left
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * `Object.compare` delegates to `compare` methods of objects when they are
         * available, and returns *0* if neither the left or right object support
         * comparison.
         * 
         * When comparing numbers, `compare` returns the difference between the left and
         * right, which expresses both the direction and magnitude of the relative values.
         * If the magnitude of the difference is not meaningful, compare *should* return
         * only *Infinity*, *-Infinity*, or *0*, but there is a long established precedent
         * from C of returning *-1* and *1* instead.
         * 
         * Note that comparison is not sufficient to distinguish equality, since *0* can
         * mean that the values are incomparable.
         * 
         * The optional second argument is an alternate comparator to use on the content of
         * the left collection, and defaults to `Object.compare`.
         * 
         * 
         */
        compare(value, compare?): number;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * The `compare` function used by this collection to determine how to order its own values.
         * 
         * 
         */
        contentCompare(left, right): any;
        
        /**
         * The `equals` function used to check whether values in this collection are equivalent.
         * 
         * 
         */
        contentEquals(left, right): any;
        
        /**
         * Adds a listener for when values are added or removed at any position.
         * 
         * Every change to an array, or any flat collection of values, can model any
         * content change as a values added or removed at a particular index.
         * 
         * Every method that changes an array can be implemented in terms of `splice(index,
         * length, ...values)`.
         * For example, every time you `set(index, value)` on an array, it can be modeled
         * as `splice(index, 1, value)`.
         * Every time you push a value onto an array, it can be modeled as `splice(length,
         * 0, value)`.
         * Every time you shift a value off an array, it cam be modeled as `splice(0, 1)`.
         * Each of these changes can be communicated with a single message, `(plus, minus,
         * index)`: the values removed after that index, the values that were added after
         * that index, and the index itself, in that order.
         * 
         * Range change listeners receive such messages synchronously, as the array
         * changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * The function receives the arguments, `(plus, minus, index)`.
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addRangeChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesRangeChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesRangeWillChange`.
         * If there is no `token`, the handler method would be either `handleRangeChange`
         * or `handleRangeWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Range + Change **or** WillChange
         * -   handleRange + Change **or** WillChange
         * -   call
         * 
         * The `collections/range-changes` module exports a range changes **mixin**.
         * The methods of `RangeChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the range changes.
         * 
         * To register a will-change listener, use
         * [addBeforeRangeChangeListener](add-before-range-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a range change listener provided by [addRangeChangeListener](add-range-change-listener).
         * 
         * 
         */
        removeRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Informs range change listeners that values were removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchRangeChange(plus, minus, index, beforeChange?): any;
        
        /**
         * Adds a listener for before values are added or removed at any position.
         * See [addRangeChangeListener](add-range-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Unregisters a range change listener provided by [addBeforeRangeChangeListener](add-before-range-change-listener) or [addRangeChangeListener](add-range-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Informs range change listeners that values will be removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchBeforeRangeChange(plus, minus, index): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
    }
    export = SortedArraySet;
}

declare module "collections/sorted-set" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * A collection of values stored in sorted order using a binary tree.
     * 
     * A `SortedSet` is a splay tree, using the top-down splaying algorithm from
     * “Self-adjusting Binary Search Trees” by Sleator and Tarjan.
     * Instead of traversing the tree, every algorithm rotates until the node of
     * interest surfaces to the root node.
     * This tends to cause the most frequently used nodes to stay toward the top over
     * time.
     * 
     * `SortedSet` instances fly the `isSorted` and `isSet` flags.
     * 
     * 
     * ### Design notes
     * 
     * This collection was designed based on analysis of two other JavaScript splay
     * tree implementations, but further augmented to incrementally track the length of
     * every subtree.
     * 
     * - a SplayTree impementation buried in Fedor Indutny’s super-secret
     *   [Callgrind](https://github.com/indutny/callgrind.js). This
     *   implementation uses parent references.
     * - a SplayTree implementation adapted by [Paolo
     *   Fragomeni](https://github.com/hij1nx/forest) from the V8 project and
     *   based on the top-down splaying algorithm from "Self-adjusting Binary
     *   Search Trees" by Sleator and Tarjan. This does not use or require
     *   parent references, so I favored it over Fedor Indutny’s style.
     * 
     * 
     */
    class SortedSet<V> {
    
        
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Adds values to the end of a collection.
         * 
         * For purposes of genericity, collections that have an intrinsic relative order
         * for their values, like a `SortedSet`, support the `push` method but do not
         * necessarily add the new values to the end of the collection.
         * 
         * As of version 1.1.0 and 2.0.1, `Heap` does not yet support `push` for multiple
         * values.
         * 
         * 
         */
        push(...values): any;
        
        /**
         * Removes a value from the end of a collection, and returns that value.
         * 
         * For a `SortedSet` and a `Heap`, this is equivalent to removing the maximum value
         * of the collection.
         * 
         * 
         */
        pop(): V;
        
        /**
         * Removes a value from the beginning of a collection, and returns that value.
         * 
         * For a `SortedSet`, this is equivalent to removing the minimum value of the
         * collection.
         * 
         * For `List` and `Deque`, this operation is very fast.
         * For an `Array`, this operation will require all subsequent values to be
         * shifted to the left to fill the void at index zero.
         * 
         * 
         */
        shift(): V;
        
        /**
         * Adds values to the beginning of a collection.
         * 
         * For purposes of genericity, collections that have an intrinsic relative order
         * for their values, like a `SortedSet`, support the `unshift` method but do
         * not necessarily add the new values to the beginning of the collection.
         * 
         * 
         */
        unshift(...values): any;
        
        /**
         * Returns the set of values including all values from both of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        union(values): any;
        
        /**
         * Returns the set of values that are in both of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        intersection(values): any;
        
        /**
         * Returns the set of values that are in this set, excluding the values that are also in the other set.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        difference(values): any;
        
        /**
         * Returns the set of values that are only in one of these sets.
         * 
         * The given values may be any iterable.
         * 
         * The returned set will be the same type of this set, for any kind of set that
         * inherits `GenericSet`.
         * 
         * 
         */
        symmetricDifference(values): any;
        
        /**
         * Whether an equivalent value exists in this collection.
         * 
         * This operation is very fast for sets because they are backed by a hash table.
         * The operation is fast for `SortedSet` and `SortedArraySet` by virtue of a binary
         * search.
         * 
         * To avoid confusion with the linear search available as `has(value, equals)` on
         * `Array`, `List`, and `Deque`, if you pass a second argument, this method will
         * throw an exception.
         * 
         * 
         */
        has(value): boolean;
        
        /**
         * Retrieves the equivalent value from the collection.
         * 
         * This is a very fast operation for `Set`, `FastSet`, `LruSet`, and `LfuSet`,
         * which are backed by hash tables.
         * This is also fast for `SortedArray` and `SortedArraySet` by virtue of a binary
         * search, and `SortedSet`, which is backed by a [splay tree][SplayTree].
         * 
         * [SplayTree]: http://en.wikipedia.org/wiki/Splay_tree
         * 
         * 
         */
        get(value): V;
        
        /**
         * Deletes the first equivalent value. Returns whether the key was found and successfully deleted.
         * 
         * This is a very fast operation for `Set`, `LruSet`, and `FastSet` because they
         * are backed by hash tables.
         * This is a fast operation for `SortedSet` because it is backed by a splay tree,
         * fast for `SortedArray` and `SortedArraySet` beause they use a binary search,
         * and fast for `Heap` because it is backed by a binary search tree projected on an
         * array.
         * 
         * However, `delete(value)` for these collections does not support the
         * `delete(value, equals)` overload.
         * Providing a second argument to `delete` in these collections will throw an
         * error.
         * 
         * 
         */
        delete(value): any;
        
        /**
         * An alias for `delete(value)` on sets that increases the overlap with the W3C `DOMTokenList` interface, implemented by `classList`.
         * 
         * 
         */
        remove(value): any;
        
        /**
         * An alias for `has(value)` on sets that increases the overlap with the W3C `DOMTokenList` interface, implemented by `classList`.
         * 
         * 
         */
        contains(value): boolean;
        
        /**
         * Toggles the existence of a value in a set.
         * 
         * If the value exists, deletes it.
         * if the value does not exist, adds it.
         * 
         * 
         */
        toggle(value: V): any;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes every value equivalent to the given value from the collection.
         * 
         * *Introduced in version 1.2.1.*
         * 
         * For sets, this is equivalent to delete, but for lists, arrays, and sorted
         * arrays, may delete more than one value.
         * For lists and arrays, this involves a linear search, from the beginning,
         * splicing out each node as it is traversed.
         * 
         * For sorted arrays, there is a mode for the provided equals and the intrinsic
         * equals.
         * The provided equals falls back to the linear search provided by the underlying
         * array.
         * However, if deleteAll uses its intrinsic order and equivalence, it can guarantee
         * that all intrinsic values are within a range from the first to the last
         * equivalent value, so it can splice all equivalent values at once, using a binary
         * search to find the first equivalent value, and a linear search to find the last..
         * The method is not implemented on Deque or Heap since random manipulation of
         * internal content is out of scope for these collections.
         * 
         * 
         */
        deleteAll(value, equals?): any;
        
        /**
         * Returns an array of the values contained in the half-open interval [start, end), that is, including the start and excluding the end.
         * 
         * For `Array`, `List`, and `Deque`, both terms may be numeric positive or negative
         * indicies.
         * 
         * For a `List`, either term may be a node.
         * 
         * 
         */
        slice(start?, end?): Array<V>;
        
        /**
         * Replaces a length of values from a starting position with the given variadic values, and returns the values that were replaced as an array.
         * 
         * 
         */
        splice(start: number, length: number, ...values: Array<V>): Array<V>;
        
        /**
         * Replaces a length of values from a starting position with the given values.
         * 
         * Unlike `splice`, if the start index is beyond the length of an array, `swap`
         * will extend the array to the given start index, leaving holes between the old
         * length and the start index.
         * 
         * In version 2, `swap` no longer returns an array of the removed length of values,
         * which further distinguishes it from `splice`, making it less wasteful in some
         * cases.
         * 
         * 
         */
        swap(start: number, length: number, values?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Returns the position of a value, or *-1* if the value is not found.
         * 
         * Returns the position of the first of equivalent values.
         * Equivalence is defined by the equality operator intrinsic to the collection,
         * either the one given as the `equals` argument to its constructor, or
         * `Object.equals` by default.
         * 
         * For a `SortedSet`, this operation is fast, because it is backed by a binary
         * search tree.
         * For a `SortedArray`, or `SortedArraySet`, this is also fast, employing a binary
         * search.
         * 
         * The implementation of `indexOf` for `Array`, `List`, and `Deque` is slower
         * but more flexible.
         * 
         * 
         */
        indexOf(value): number;
        
        /**
         * Finds the first equivalent value.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the left of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `find`, which conflicts with the definition
         * of `find` provided by ECMAScript 6.
         * In version 2, this method is called `findValue` to eliminate the conflict.
         * 
         * 
         */
        find(value, equals?, start?): any;
        
        /**
         * Finds the first equivalent value.
         * 
         * For `List` and `SortedSet`, returns the node at which the value was found, or
         * `null` if no equivalent value exists.
         * For other collections, returns the index of the found value or *-1* if no
         * equivalent value exists.
         * Regardless of the collection, the value returned is suitable for passing to
         * other methods like `slice`, `splice`, and `swap`.
         * 
         * The optional `equals` argument is alternative for `Object.equals`.
         * 
         * The optional `start` is the index from which to begin searching.
         * Values to the left of the start index will not be considered.
         * 
         * `SortedSet`, `SortedArray`, and `SortedArraySet` do not support overriding the
         * `equals` operator nor the `start` index, and will throw an exception if provided
         * either.
         * A meaningful implementation with these parameters may be provided in a future
         * release.
         * 
         * In version 1, this method is called `find`, which conflicts with the definition
         * of `find` provided by ECMAScript 6.
         * In version 2, this method is called `findValue` to eliminate the conflict.
         * 
         * 
         */
        findValue(value, equals?, start?): any;
        
        /**
         * Finds the smallest value, returning the node at which it was found, or undefined.
         * 
         * Values are compared using the collection’s intrinsic `contentEquals` and
         * `contentCompare`, determined at time of construction.
         * 
         * This is fast (logarithmic) and performs no rotations of the splay tree backing
         * the `SortedSet`.
         * 
         * 
         */
        findLeast(): any;
        
        /**
         * Finds the smallest value greater than the given value, returning the node at which it was found, or undefined.
         * 
         * Values are compared using the collection’s intrinsic `contentEquals` and
         * `contentCompare`, determined at time of construction.
         * 
         * This is fast (logarithmic) and may rotate the underlying splay tree.
         * 
         * 
         * 
         */
        findLeastGreaterThan(value): any;
        
        /**
         * Finds the smallest value greater than or equal to the given value, returning the node at which it was found, or undefined.
         * 
         * Values are compared using the collection’s intrinsic `contentEquals` and
         * `contentCompare`, determined at time of construction.
         * 
         * This is fast (logarithmic) and may rotate the underlying splay tree.
         * 
         * 
         */
        findLeastGreaterThanOrEqual(value): any;
        
        /**
         * Finds the largest value, returning the node at which it was found, or undefined.
         * 
         * Values are compared using the collection’s intrinsic `contentEquals` and
         * `contentCompare`, determined at time of construction.
         * 
         * This is fast (logarithmic) and performs no rotations of the splay tree backing
         * the `SortedSet`.
         * 
         * 
         */
        findGreatest(): TreeNode<V>;
        
        /**
         * Finds the largest value less than the given value, returning the node at which it was found, or undefined.
         * 
         * Values are compared using the collection’s intrinsic `contentEquals` and
         * `contentCompare`, determined at time of construction.
         * 
         * This is fast (logarithmic) and may rotate the underlying splay tree.
         * 
         * 
         */
        findLGreatestLessThan(value): TreeNode<V>;
        
        /**
         * Finds the largest value less than or equal to the given value, returning the node at which it was found, or undefined.
         * 
         * Values are compared using the collection’s intrinsic `contentEquals` and
         * `contentCompare`, determined at time of construction.
         * 
         * This is fast (logarithmic) and may rotate the underlying splay tree.
         * 
         * 
         */
        findGreatestLessThanOrEqual(value): TreeNode<V>;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns one, arbitrary value from this collection, or *undefined* if there are none.
         * 
         * 
         */
        one(): V;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * The `compare` function used by this collection to determine how to order its own values.
         * 
         * 
         */
        contentCompare(left, right): any;
        
        /**
         * The `equals` function used to check whether values in this collection are equivalent.
         * 
         * 
         */
        contentEquals(left, right): any;
        
        /**
         * Rotates a splay tree until the value is at the root, or would be between the root and one of its children.
         * 
         * 
         */
        splay(value): any;
        
        /**
         * Rotates the tree until the node at a given index floats to the top.
         * 
         * 
         */
        splayIndex(index): any;
        
        /**
         * Adds a listener for when values are added or removed at any position.
         * 
         * Every change to an array, or any flat collection of values, can model any
         * content change as a values added or removed at a particular index.
         * 
         * Every method that changes an array can be implemented in terms of `splice(index,
         * length, ...values)`.
         * For example, every time you `set(index, value)` on an array, it can be modeled
         * as `splice(index, 1, value)`.
         * Every time you push a value onto an array, it can be modeled as `splice(length,
         * 0, value)`.
         * Every time you shift a value off an array, it cam be modeled as `splice(0, 1)`.
         * Each of these changes can be communicated with a single message, `(plus, minus,
         * index)`: the values removed after that index, the values that were added after
         * that index, and the index itself, in that order.
         * 
         * Range change listeners receive such messages synchronously, as the array
         * changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * The function receives the arguments, `(plus, minus, index)`.
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addRangeChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesRangeChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesRangeWillChange`.
         * If there is no `token`, the handler method would be either `handleRangeChange`
         * or `handleRangeWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Range + Change **or** WillChange
         * -   handleRange + Change **or** WillChange
         * -   call
         * 
         * The `collections/range-changes` module exports a range changes **mixin**.
         * The methods of `RangeChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the range changes.
         * 
         * To register a will-change listener, use
         * [addBeforeRangeChangeListener](add-before-range-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a range change listener provided by [addRangeChangeListener](add-range-change-listener).
         * 
         * 
         */
        removeRangeChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Informs range change listeners that values were removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchRangeChange(plus, minus, index, beforeChange?): any;
        
        /**
         * Adds a listener for before values are added or removed at any position.
         * See [addRangeChangeListener](add-range-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Unregisters a range change listener provided by [addBeforeRangeChangeListener](add-before-range-change-listener) or [addRangeChangeListener](add-range-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeRangeChangeListener(listener, token?): any;
        
        /**
         * Informs range change listeners that values will be removed then added at an index.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         */
        dispatchBeforeRangeChange(plus, minus, index): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
    }
    export = SortedSet;
}

declare module "collections/fast-map" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * The backing store for a `Map`.
     * 
     * The `FastMap` is a map from arbitrary keys to values.
     * It is itself backed by a `FastSet` of *[key, value]* entries, with
     * `contentEquals` and `contentCompare` overridden to consider only the *key*.
     * The `FastMap` is fast because it does not track insertion order of the entries,
     * so it will not behave exactly like an ECMAScript 6 `Map` in that regard.
     * The enumeration order of the map will depend on whether there are hash
     * collisions.
     * If there are no hash collisions, its enumeration order is consistent with `Map`.
     * 
     * 
     */
    class FastMap<K, V> {
        
        constructor(values?: any, equals?: (left: K, right: K) => boolean, hash?: (value: K) => string, getDefault?: any);
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Returns whether an entry with the given key exists in a `Map`.
         * 
         * 
         */
        has(key): boolean;
        
        /**
         * Gets the value for a key in a map.
         * 
         * If there is no entry with the request key, and the user calls `get` with a
         * second argument *even if that argument is undefined*, the second argument will
         * be returned instead.
         * Otherwise, `get` will return the result of `getDefault(key)`, which itself
         * defaults to returning undefined.
         * 
         * Every map implementation gives an opportunity to override `getDefault` through
         * the constructor, but it can always be overridden on either the instance or the
         * prototype.
         * It is often useful to provide a `getDefault` that will create, save, and return
         * a default instance for a given key.
         * 
         * ```js
         * var users = new Dict();
         * users.getDefault = function (id) {
         *     var user = new User(id);
         *     this.set(id, user);
         *     return user;
         * };
         * ```
         * 
         * For the purposes of the `get` and `set` methods, an `Array` behaves like a map
         * from index to the value at that index.
         * 
         * ```js
         * var value = [1, 2, 3].get(1);
         * expect(value).toBe(2);
         * ```
         * 
         * In contrast, for the purposes of the `has` method, an `Array` behaves as a list
         * of values.
         * 
         * ```js
         * var found = [1, 2, 3].has(1);
         * expect(found).toBe(true);
         * ```
         * 
         * 
         */
        get(keyOrIndex, defaultReturn?): V;
        
        /**
         * Sets the value for a given key.
         * 
         * 
         */
        set(key, value): any;
        
        /**
         * Adds a value for a given key to a map.
         * 
         * This is an alias for `set(key, value)` that does not have an obvious reason to
         * exist.
         * The purpose of this method is to allow certain generic collection methods
         * including `addEach`, `filter`, and `clone`, to treat sets and maps in the same
         * fashion, without regard for whether the keys are or not meaningful for the
         * collection.
         * For example, sets implement `add(value)`, but maps implement `add(value, key)`.
         * Iterating a `List` provides meaningful indexes that can be used for keys if they
         * are converted to maps.
         * Consider this excerpt from `addEach(values)` for generic collections.
         * 
         * ```js
         * values.forEach(this.add, this);
         * ```
         * 
         * This copies values from an abitrary collection into this one.
         * Regardless of whether this collection is a map or a set, and whether the values
         * come from a map or a set, `add` is able to bridge the gap.
         * This is particularly important since `addEach(values)` is the last operation of
         * every collection constructor.
         * 
         * 
         */
        add(value, key): any;
        
        /**
         * Deletes the value for a given key. Returns whether the key was found and successfully deleted.
         * 
         * 
         */
        delete(key): any;
        
        /**
         * Returns an array of the keys of this map.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        keys(): Array<string>;
        
        /**
         * Returns an array of the values of this map.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        values(): Array<V>;
        
        /**
         * Returns an array of all *[key, value]* entries for this map.
         * 
         * Previous versions called this method `items()`.
         * This name has been deprecated in version 1, and removed in version 2.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        entries(): Array<Array<any>>;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * The `equals` function used to check whether values in this collection are equivalent.
         * 
         * 
         */
        contentEquals(left, right): any;
        
        /**
         * The `hash` function used by this collection to hash its own values.
         * 
         * 
         */
        contentHash(value): any;
        
        /**
         * Adds a listener for when the value for a key changes, or when entries are added or removed.
         * 
         * When the value for a key *changes*, maps will first dispatch a *map will change*
         * notification with the old value followed by a *map change* event with the new
         * value.
         * When a new entry gets *added* to a map, it will first dispatch a *map will
         * change* with undefined, followed by the *map change* with the initial value.
         * When an existing entry is *deleted* from a map, it will first dispatch a *map
         * will change* with the current value, followed by a *map change* with undefined.
         * 
         * As such, it is not possible to distinguish an undefined value from a
         * non-existant value, and it is not possible to capture both the new and old value
         * with a single listener.
         * These problems are addressed in version 2 with a new `observeMapChange`
         * interface.
         * 
         * Map change listeners receive such messages synchronously, as the map changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * A map change listener function `(value, key, map)`, the same argument pattern
         * familiar from iterator callbacks.
         * 
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addMapChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesMapChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesMapWillChange`.
         * If there is no `token`, the handler method would be either `handleMapChange`
         * or `handleMapWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Map + Change **or** WillChange
         * -   handleMap + Change **or** WillChange
         * -   call
         * 
         * The `collections/map-changes` module exports a map changes **mixin**.
         * The methods of `MapChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the map changes.
         * 
         * To register a will-change listener, use
         * [addBeforeMapChangeListener](add-before-map-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Adds a listener for before map entries are created, deleted, or updated.
         * See [addMapChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Unregisters a map change listener provided by [addMapChangeListener](add-map-change-listener).
         * 
         * 
         */
        removeMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a map change listener provided by [addBeforeMapChangeListener](add-before-map-change-listener) or [addMapChangeListener](add-map-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Informs map change listeners that an entry was created, deleted, or updated.
         * 
         * Collections that can dispatch map changes call this method to inform listeners.
         * 
         * 
         */
        dispatchMapChange(key, value, beforeChange?): any;
        
        /**
         * Informs map change listeners that an entry will be created, deleted, or updated.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         * 
         */
        dispatchBeforeMapChange(key, value): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
    }
    export = FastMap;
}

declare module "collections/lfu-map" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * A map with a maximum capacity that will evict the least frequently used entry.
     * 
     * An `LfuMap` is backed by an `LfuSet` of *[key, value]* entries, with
     * `contentEquals` and `contentHash` overriden to only consider the *key*.
     * 
     * 
     */
    class LfuMap<K, V> {
    
        
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Returns whether an entry with the given key exists in a `Map`.
         * 
         * 
         */
        has(key): boolean;
        
        /**
         * Gets the value for a key in a map.
         * 
         * If there is no entry with the request key, and the user calls `get` with a
         * second argument *even if that argument is undefined*, the second argument will
         * be returned instead.
         * Otherwise, `get` will return the result of `getDefault(key)`, which itself
         * defaults to returning undefined.
         * 
         * Every map implementation gives an opportunity to override `getDefault` through
         * the constructor, but it can always be overridden on either the instance or the
         * prototype.
         * It is often useful to provide a `getDefault` that will create, save, and return
         * a default instance for a given key.
         * 
         * ```js
         * var users = new Dict();
         * users.getDefault = function (id) {
         *     var user = new User(id);
         *     this.set(id, user);
         *     return user;
         * };
         * ```
         * 
         * For the purposes of the `get` and `set` methods, an `Array` behaves like a map
         * from index to the value at that index.
         * 
         * ```js
         * var value = [1, 2, 3].get(1);
         * expect(value).toBe(2);
         * ```
         * 
         * In contrast, for the purposes of the `has` method, an `Array` behaves as a list
         * of values.
         * 
         * ```js
         * var found = [1, 2, 3].has(1);
         * expect(found).toBe(true);
         * ```
         * 
         * 
         */
        get(keyOrIndex, defaultReturn?): V;
        
        /**
         * Sets the value for a given key.
         * 
         * 
         */
        set(key, value): any;
        
        /**
         * Adds a value for a given key to a map.
         * 
         * This is an alias for `set(key, value)` that does not have an obvious reason to
         * exist.
         * The purpose of this method is to allow certain generic collection methods
         * including `addEach`, `filter`, and `clone`, to treat sets and maps in the same
         * fashion, without regard for whether the keys are or not meaningful for the
         * collection.
         * For example, sets implement `add(value)`, but maps implement `add(value, key)`.
         * Iterating a `List` provides meaningful indexes that can be used for keys if they
         * are converted to maps.
         * Consider this excerpt from `addEach(values)` for generic collections.
         * 
         * ```js
         * values.forEach(this.add, this);
         * ```
         * 
         * This copies values from an abitrary collection into this one.
         * Regardless of whether this collection is a map or a set, and whether the values
         * come from a map or a set, `add` is able to bridge the gap.
         * This is particularly important since `addEach(values)` is the last operation of
         * every collection constructor.
         * 
         * 
         */
        add(value, key): any;
        
        /**
         * Deletes the value for a given key. Returns whether the key was found and successfully deleted.
         * 
         * 
         */
        delete(key): any;
        
        /**
         * Returns an array of the keys of this map.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        keys(): Array<string>;
        
        /**
         * Returns an array of the values of this map.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        values(): Array<V>;
        
        /**
         * Returns an array of all *[key, value]* entries for this map.
         * 
         * Previous versions called this method `items()`.
         * This name has been deprecated in version 1, and removed in version 2.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        entries(): Array<Array<any>>;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * The `equals` function used to check whether values in this collection are equivalent.
         * 
         * 
         */
        contentEquals(left, right): any;
        
        /**
         * The `hash` function used by this collection to hash its own values.
         * 
         * 
         */
        contentHash(value): any;
        
        /**
         * Adds a listener for when the value for a key changes, or when entries are added or removed.
         * 
         * When the value for a key *changes*, maps will first dispatch a *map will change*
         * notification with the old value followed by a *map change* event with the new
         * value.
         * When a new entry gets *added* to a map, it will first dispatch a *map will
         * change* with undefined, followed by the *map change* with the initial value.
         * When an existing entry is *deleted* from a map, it will first dispatch a *map
         * will change* with the current value, followed by a *map change* with undefined.
         * 
         * As such, it is not possible to distinguish an undefined value from a
         * non-existant value, and it is not possible to capture both the new and old value
         * with a single listener.
         * These problems are addressed in version 2 with a new `observeMapChange`
         * interface.
         * 
         * Map change listeners receive such messages synchronously, as the map changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * A map change listener function `(value, key, map)`, the same argument pattern
         * familiar from iterator callbacks.
         * 
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addMapChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesMapChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesMapWillChange`.
         * If there is no `token`, the handler method would be either `handleMapChange`
         * or `handleMapWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Map + Change **or** WillChange
         * -   handleMap + Change **or** WillChange
         * -   call
         * 
         * The `collections/map-changes` module exports a map changes **mixin**.
         * The methods of `MapChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the map changes.
         * 
         * To register a will-change listener, use
         * [addBeforeMapChangeListener](add-before-map-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Adds a listener for before map entries are created, deleted, or updated.
         * See [addMapChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Unregisters a map change listener provided by [addMapChangeListener](add-map-change-listener).
         * 
         * 
         */
        removeMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a map change listener provided by [addBeforeMapChangeListener](add-before-map-change-listener) or [addMapChangeListener](add-map-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Informs map change listeners that an entry was created, deleted, or updated.
         * 
         * Collections that can dispatch map changes call this method to inform listeners.
         * 
         * 
         */
        dispatchMapChange(key, value, beforeChange?): any;
        
        /**
         * Informs map change listeners that an entry will be created, deleted, or updated.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         * 
         */
        dispatchBeforeMapChange(key, value): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
    }
    export = LfuMap;
}

declare module "collections/lru-map" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * A map with a maximum capacity that will evict the least recently used entry.
     * 
     * An `LruMap` is backed by an `LruSet` of *[key, value]* entries, with
     * `contentEquals` and `contentHash` overriden to only consider the *key*.
     * 
     * 
     */
    class LruMap<K, V> {
    
        
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Returns whether an entry with the given key exists in a `Map`.
         * 
         * 
         */
        has(key): boolean;
        
        /**
         * Gets the value for a key in a map.
         * 
         * If there is no entry with the request key, and the user calls `get` with a
         * second argument *even if that argument is undefined*, the second argument will
         * be returned instead.
         * Otherwise, `get` will return the result of `getDefault(key)`, which itself
         * defaults to returning undefined.
         * 
         * Every map implementation gives an opportunity to override `getDefault` through
         * the constructor, but it can always be overridden on either the instance or the
         * prototype.
         * It is often useful to provide a `getDefault` that will create, save, and return
         * a default instance for a given key.
         * 
         * ```js
         * var users = new Dict();
         * users.getDefault = function (id) {
         *     var user = new User(id);
         *     this.set(id, user);
         *     return user;
         * };
         * ```
         * 
         * For the purposes of the `get` and `set` methods, an `Array` behaves like a map
         * from index to the value at that index.
         * 
         * ```js
         * var value = [1, 2, 3].get(1);
         * expect(value).toBe(2);
         * ```
         * 
         * In contrast, for the purposes of the `has` method, an `Array` behaves as a list
         * of values.
         * 
         * ```js
         * var found = [1, 2, 3].has(1);
         * expect(found).toBe(true);
         * ```
         * 
         * 
         */
        get(keyOrIndex, defaultReturn?): V;
        
        /**
         * Sets the value for a given key.
         * 
         * 
         */
        set(key, value): any;
        
        /**
         * Adds a value for a given key to a map.
         * 
         * This is an alias for `set(key, value)` that does not have an obvious reason to
         * exist.
         * The purpose of this method is to allow certain generic collection methods
         * including `addEach`, `filter`, and `clone`, to treat sets and maps in the same
         * fashion, without regard for whether the keys are or not meaningful for the
         * collection.
         * For example, sets implement `add(value)`, but maps implement `add(value, key)`.
         * Iterating a `List` provides meaningful indexes that can be used for keys if they
         * are converted to maps.
         * Consider this excerpt from `addEach(values)` for generic collections.
         * 
         * ```js
         * values.forEach(this.add, this);
         * ```
         * 
         * This copies values from an abitrary collection into this one.
         * Regardless of whether this collection is a map or a set, and whether the values
         * come from a map or a set, `add` is able to bridge the gap.
         * This is particularly important since `addEach(values)` is the last operation of
         * every collection constructor.
         * 
         * 
         */
        add(value, key): any;
        
        /**
         * Deletes the value for a given key. Returns whether the key was found and successfully deleted.
         * 
         * 
         */
        delete(key): any;
        
        /**
         * Returns an array of the keys of this map.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        keys(): Array<string>;
        
        /**
         * Returns an array of the values of this map.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        values(): Array<V>;
        
        /**
         * Returns an array of all *[key, value]* entries for this map.
         * 
         * Previous versions called this method `items()`.
         * This name has been deprecated in version 1, and removed in version 2.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        entries(): Array<Array<any>>;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * The `equals` function used to check whether values in this collection are equivalent.
         * 
         * 
         */
        contentEquals(left, right): any;
        
        /**
         * The `hash` function used by this collection to hash its own values.
         * 
         * 
         */
        contentHash(value): any;
        
        /**
         * Adds a listener for when the value for a key changes, or when entries are added or removed.
         * 
         * When the value for a key *changes*, maps will first dispatch a *map will change*
         * notification with the old value followed by a *map change* event with the new
         * value.
         * When a new entry gets *added* to a map, it will first dispatch a *map will
         * change* with undefined, followed by the *map change* with the initial value.
         * When an existing entry is *deleted* from a map, it will first dispatch a *map
         * will change* with the current value, followed by a *map change* with undefined.
         * 
         * As such, it is not possible to distinguish an undefined value from a
         * non-existant value, and it is not possible to capture both the new and old value
         * with a single listener.
         * These problems are addressed in version 2 with a new `observeMapChange`
         * interface.
         * 
         * Map change listeners receive such messages synchronously, as the map changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * A map change listener function `(value, key, map)`, the same argument pattern
         * familiar from iterator callbacks.
         * 
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addMapChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesMapChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesMapWillChange`.
         * If there is no `token`, the handler method would be either `handleMapChange`
         * or `handleMapWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Map + Change **or** WillChange
         * -   handleMap + Change **or** WillChange
         * -   call
         * 
         * The `collections/map-changes` module exports a map changes **mixin**.
         * The methods of `MapChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the map changes.
         * 
         * To register a will-change listener, use
         * [addBeforeMapChangeListener](add-before-map-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Adds a listener for before map entries are created, deleted, or updated.
         * See [addMapChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Unregisters a map change listener provided by [addMapChangeListener](add-map-change-listener).
         * 
         * 
         */
        removeMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a map change listener provided by [addBeforeMapChangeListener](add-before-map-change-listener) or [addMapChangeListener](add-map-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Informs map change listeners that an entry was created, deleted, or updated.
         * 
         * Collections that can dispatch map changes call this method to inform listeners.
         * 
         * 
         */
        dispatchMapChange(key, value, beforeChange?): any;
        
        /**
         * Informs map change listeners that an entry will be created, deleted, or updated.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         * 
         */
        dispatchBeforeMapChange(key, value): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
    }
    export = LruMap;
}

declare module "collections/multi-map" {
    import collections = require("collections");
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * A map from keys to buckets, typically arrays.
     * 
     * A `MultMap` is a thin layer on a `Map`.
     * The `getDefault` and `set` methods are overriden to ensure that there will
     * always be a single bucket value intrinsic to each key, always returned by `get`
     * and only modified by `set`.
     * 
     * The optional `bucket` argument overrides the `MultiMap`’s default `bucket(key)`
     * method, which creates a new bucketsfor a given key.
     * By default, this method just returns an empty array.
     * 
     * The optional `equals` and `hash` arguments override the `contentEquals` and
     * `contentHash` methods, which operate on keys of the map to find where to store
     * entries.
     * 
     * 
     */
    class MultiMap<K, V extends collections.Collection<any>> {
        
        constructor(values?: collections.Collection<any>, bucket?: (key: K) => V, equals?: (left: V, right: V) => boolean, hash?: (value: V) => string);
    
        bucket: (key: K) => V;
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Returns whether an entry with the given key exists in a `Map`.
         * 
         * 
         */
        has(key): boolean;
        
        /**
         * Gets the value for a key in a map.
         * 
         * If there is no entry with the request key, and the user calls `get` with a
         * second argument *even if that argument is undefined*, the second argument will
         * be returned instead.
         * Otherwise, `get` will return the result of `getDefault(key)`, which itself
         * defaults to returning undefined.
         * 
         * Every map implementation gives an opportunity to override `getDefault` through
         * the constructor, but it can always be overridden on either the instance or the
         * prototype.
         * It is often useful to provide a `getDefault` that will create, save, and return
         * a default instance for a given key.
         * 
         * ```js
         * var users = new Dict();
         * users.getDefault = function (id) {
         *     var user = new User(id);
         *     this.set(id, user);
         *     return user;
         * };
         * ```
         * 
         * For the purposes of the `get` and `set` methods, an `Array` behaves like a map
         * from index to the value at that index.
         * 
         * ```js
         * var value = [1, 2, 3].get(1);
         * expect(value).toBe(2);
         * ```
         * 
         * In contrast, for the purposes of the `has` method, an `Array` behaves as a list
         * of values.
         * 
         * ```js
         * var found = [1, 2, 3].has(1);
         * expect(found).toBe(true);
         * ```
         * 
         * 
         */
        get(keyOrIndex, defaultReturn?): V;
        
        /**
         * Sets the value for a given key.
         * 
         * 
         */
        set(key, value): any;
        
        /**
         * Adds a value for a given key to a map.
         * 
         * This is an alias for `set(key, value)` that does not have an obvious reason to
         * exist.
         * The purpose of this method is to allow certain generic collection methods
         * including `addEach`, `filter`, and `clone`, to treat sets and maps in the same
         * fashion, without regard for whether the keys are or not meaningful for the
         * collection.
         * For example, sets implement `add(value)`, but maps implement `add(value, key)`.
         * Iterating a `List` provides meaningful indexes that can be used for keys if they
         * are converted to maps.
         * Consider this excerpt from `addEach(values)` for generic collections.
         * 
         * ```js
         * values.forEach(this.add, this);
         * ```
         * 
         * This copies values from an abitrary collection into this one.
         * Regardless of whether this collection is a map or a set, and whether the values
         * come from a map or a set, `add` is able to bridge the gap.
         * This is particularly important since `addEach(values)` is the last operation of
         * every collection constructor.
         * 
         * 
         */
        add(value, key): any;
        
        /**
         * Deletes the value for a given key. Returns whether the key was found and successfully deleted.
         * 
         * 
         */
        delete(key): any;
        
        /**
         * Returns an array of the keys of this map.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        keys(): Array<string>;
        
        /**
         * Returns an array of the values of this map.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        values(): Array<V>;
        
        /**
         * Returns an array of all *[key, value]* entries for this map.
         * 
         * Previous versions called this method `items()`.
         * This name has been deprecated in version 1, and removed in version 2.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        entries(): Array<Array<any>>;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * The `equals` function used to check whether values in this collection are equivalent.
         * 
         * 
         */
        contentEquals(left, right): any;
        
        /**
         * The `hash` function used by this collection to hash its own values.
         * 
         * 
         */
        contentHash(value): any;
        
        /**
         * Adds a listener for when the value for a key changes, or when entries are added or removed.
         * 
         * When the value for a key *changes*, maps will first dispatch a *map will change*
         * notification with the old value followed by a *map change* event with the new
         * value.
         * When a new entry gets *added* to a map, it will first dispatch a *map will
         * change* with undefined, followed by the *map change* with the initial value.
         * When an existing entry is *deleted* from a map, it will first dispatch a *map
         * will change* with the current value, followed by a *map change* with undefined.
         * 
         * As such, it is not possible to distinguish an undefined value from a
         * non-existant value, and it is not possible to capture both the new and old value
         * with a single listener.
         * These problems are addressed in version 2 with a new `observeMapChange`
         * interface.
         * 
         * Map change listeners receive such messages synchronously, as the map changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * A map change listener function `(value, key, map)`, the same argument pattern
         * familiar from iterator callbacks.
         * 
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addMapChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesMapChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesMapWillChange`.
         * If there is no `token`, the handler method would be either `handleMapChange`
         * or `handleMapWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Map + Change **or** WillChange
         * -   handleMap + Change **or** WillChange
         * -   call
         * 
         * The `collections/map-changes` module exports a map changes **mixin**.
         * The methods of `MapChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the map changes.
         * 
         * To register a will-change listener, use
         * [addBeforeMapChangeListener](add-before-map-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Adds a listener for before map entries are created, deleted, or updated.
         * See [addMapChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Unregisters a map change listener provided by [addMapChangeListener](add-map-change-listener).
         * 
         * 
         */
        removeMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a map change listener provided by [addBeforeMapChangeListener](add-before-map-change-listener) or [addMapChangeListener](add-map-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Informs map change listeners that an entry was created, deleted, or updated.
         * 
         * Collections that can dispatch map changes call this method to inform listeners.
         * 
         * 
         */
        dispatchMapChange(key, value, beforeChange?): any;
        
        /**
         * Informs map change listeners that an entry will be created, deleted, or updated.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         * 
         */
        dispatchBeforeMapChange(key, value): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
    }
    export = MultiMap;
}

declare module "collections/sorted-map" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * A map with entries sorted by key.
     * 
     * A `SortedMap` is backed by a `SortedSet` of *[key, value]* entries, with
     * `contentEquals` and `contentCompare` overridden to consider only the key.
     * 
     * 
     */
    class SortedMap<K, V> {
    
        
        
        /**
         * The number of items in this collection.
         */
        length: number;
    
        
        
        /**
         * Returns whether an entry with the given key exists in a `Map`.
         * 
         * 
         */
        has(key): boolean;
        
        /**
         * Gets the value for a key in a map.
         * 
         * If there is no entry with the request key, and the user calls `get` with a
         * second argument *even if that argument is undefined*, the second argument will
         * be returned instead.
         * Otherwise, `get` will return the result of `getDefault(key)`, which itself
         * defaults to returning undefined.
         * 
         * Every map implementation gives an opportunity to override `getDefault` through
         * the constructor, but it can always be overridden on either the instance or the
         * prototype.
         * It is often useful to provide a `getDefault` that will create, save, and return
         * a default instance for a given key.
         * 
         * ```js
         * var users = new Dict();
         * users.getDefault = function (id) {
         *     var user = new User(id);
         *     this.set(id, user);
         *     return user;
         * };
         * ```
         * 
         * For the purposes of the `get` and `set` methods, an `Array` behaves like a map
         * from index to the value at that index.
         * 
         * ```js
         * var value = [1, 2, 3].get(1);
         * expect(value).toBe(2);
         * ```
         * 
         * In contrast, for the purposes of the `has` method, an `Array` behaves as a list
         * of values.
         * 
         * ```js
         * var found = [1, 2, 3].has(1);
         * expect(found).toBe(true);
         * ```
         * 
         * 
         */
        get(keyOrIndex, defaultReturn?): V;
        
        /**
         * Sets the value for a given key.
         * 
         * 
         */
        set(key, value): any;
        
        /**
         * Adds a value for a given key to a map.
         * 
         * This is an alias for `set(key, value)` that does not have an obvious reason to
         * exist.
         * The purpose of this method is to allow certain generic collection methods
         * including `addEach`, `filter`, and `clone`, to treat sets and maps in the same
         * fashion, without regard for whether the keys are or not meaningful for the
         * collection.
         * For example, sets implement `add(value)`, but maps implement `add(value, key)`.
         * Iterating a `List` provides meaningful indexes that can be used for keys if they
         * are converted to maps.
         * Consider this excerpt from `addEach(values)` for generic collections.
         * 
         * ```js
         * values.forEach(this.add, this);
         * ```
         * 
         * This copies values from an abitrary collection into this one.
         * Regardless of whether this collection is a map or a set, and whether the values
         * come from a map or a set, `add` is able to bridge the gap.
         * This is particularly important since `addEach(values)` is the last operation of
         * every collection constructor.
         * 
         * 
         */
        add(value, key): any;
        
        /**
         * Deletes the value for a given key. Returns whether the key was found and successfully deleted.
         * 
         * 
         */
        delete(key): any;
        
        /**
         * Returns an array of the keys of this map.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        keys(): Array<string>;
        
        /**
         * Returns an array of the values of this map.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        values(): Array<V>;
        
        /**
         * Returns an array of all *[key, value]* entries for this map.
         * 
         * Previous versions called this method `items()`.
         * This name has been deprecated in version 1, and removed in version 2.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        entries(): Array<Array<any>>;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * The `compare` function used by this collection to determine how to order its own values.
         * 
         * 
         */
        contentCompare(left, right): any;
        
        /**
         * The `equals` function used to check whether values in this collection are equivalent.
         * 
         * 
         */
        contentEquals(left, right): any;
        
        /**
         * Adds a listener for when the value for a key changes, or when entries are added or removed.
         * 
         * When the value for a key *changes*, maps will first dispatch a *map will change*
         * notification with the old value followed by a *map change* event with the new
         * value.
         * When a new entry gets *added* to a map, it will first dispatch a *map will
         * change* with undefined, followed by the *map change* with the initial value.
         * When an existing entry is *deleted* from a map, it will first dispatch a *map
         * will change* with the current value, followed by a *map change* with undefined.
         * 
         * As such, it is not possible to distinguish an undefined value from a
         * non-existant value, and it is not possible to capture both the new and old value
         * with a single listener.
         * These problems are addressed in version 2 with a new `observeMapChange`
         * interface.
         * 
         * Map change listeners receive such messages synchronously, as the map changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * A map change listener function `(value, key, map)`, the same argument pattern
         * familiar from iterator callbacks.
         * 
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addMapChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesMapChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesMapWillChange`.
         * If there is no `token`, the handler method would be either `handleMapChange`
         * or `handleMapWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Map + Change **or** WillChange
         * -   handleMap + Change **or** WillChange
         * -   call
         * 
         * The `collections/map-changes` module exports a map changes **mixin**.
         * The methods of `MapChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the map changes.
         * 
         * To register a will-change listener, use
         * [addBeforeMapChangeListener](add-before-map-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Adds a listener for before map entries are created, deleted, or updated.
         * See [addMapChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Unregisters a map change listener provided by [addMapChangeListener](add-map-change-listener).
         * 
         * 
         */
        removeMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a map change listener provided by [addBeforeMapChangeListener](add-before-map-change-listener) or [addMapChangeListener](add-map-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Informs map change listeners that an entry was created, deleted, or updated.
         * 
         * Collections that can dispatch map changes call this method to inform listeners.
         * 
         * 
         */
        dispatchMapChange(key, value, beforeChange?): any;
        
        /**
         * Informs map change listeners that an entry will be created, deleted, or updated.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         * 
         */
        dispatchBeforeMapChange(key, value): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
    }
    export = SortedMap;
}

declare module "collections/sorted-array-map" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * A map of key value pairs, sorted by key, backed by an array.
     * 
     * A `SortedArrayMap` is a `Map` backed by a `SortedArraySet`, which is in turn
     * backed by a `SortedArray`, backed by an `Array`.
     * The sorted array maintains the order of the entries using a binary search
     * considering only the key portion of each entry.
     * 
     * `SortedArrayMap` instances fly the `isSorted` and `isMap` flags.
     * 
     * 
     */
    class SortedArrayMap<K, V> {
    
        
        
        
        /**
         * Returns whether an entry with the given key exists in a `Map`.
         * 
         * 
         */
        has(key): boolean;
        
        /**
         * Gets the value for a key in a map.
         * 
         * If there is no entry with the request key, and the user calls `get` with a
         * second argument *even if that argument is undefined*, the second argument will
         * be returned instead.
         * Otherwise, `get` will return the result of `getDefault(key)`, which itself
         * defaults to returning undefined.
         * 
         * Every map implementation gives an opportunity to override `getDefault` through
         * the constructor, but it can always be overridden on either the instance or the
         * prototype.
         * It is often useful to provide a `getDefault` that will create, save, and return
         * a default instance for a given key.
         * 
         * ```js
         * var users = new Dict();
         * users.getDefault = function (id) {
         *     var user = new User(id);
         *     this.set(id, user);
         *     return user;
         * };
         * ```
         * 
         * For the purposes of the `get` and `set` methods, an `Array` behaves like a map
         * from index to the value at that index.
         * 
         * ```js
         * var value = [1, 2, 3].get(1);
         * expect(value).toBe(2);
         * ```
         * 
         * In contrast, for the purposes of the `has` method, an `Array` behaves as a list
         * of values.
         * 
         * ```js
         * var found = [1, 2, 3].has(1);
         * expect(found).toBe(true);
         * ```
         * 
         * 
         */
        get(keyOrIndex, defaultReturn?): V;
        
        /**
         * Sets the value for a given key.
         * 
         * 
         */
        set(key, value): any;
        
        /**
         * Adds a value for a given key to a map.
         * 
         * This is an alias for `set(key, value)` that does not have an obvious reason to
         * exist.
         * The purpose of this method is to allow certain generic collection methods
         * including `addEach`, `filter`, and `clone`, to treat sets and maps in the same
         * fashion, without regard for whether the keys are or not meaningful for the
         * collection.
         * For example, sets implement `add(value)`, but maps implement `add(value, key)`.
         * Iterating a `List` provides meaningful indexes that can be used for keys if they
         * are converted to maps.
         * Consider this excerpt from `addEach(values)` for generic collections.
         * 
         * ```js
         * values.forEach(this.add, this);
         * ```
         * 
         * This copies values from an abitrary collection into this one.
         * Regardless of whether this collection is a map or a set, and whether the values
         * come from a map or a set, `add` is able to bridge the gap.
         * This is particularly important since `addEach(values)` is the last operation of
         * every collection constructor.
         * 
         * 
         */
        add(value, key): any;
        
        /**
         * Deletes the value for a given key. Returns whether the key was found and successfully deleted.
         * 
         * 
         */
        delete(key): any;
        
        /**
         * Returns an array of the keys of this map.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        keys(): Array<string>;
        
        /**
         * Returns an array of the values of this map.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        values(): Array<V>;
        
        /**
         * Returns an array of all *[key, value]* entries for this map.
         * 
         * Previous versions called this method `items()`.
         * This name has been deprecated in version 1, and removed in version 2.
         * 
         * The ES6 standard stipulates that this method should return an iterator.
         * This library does not yet comply, but may in version 2.
         * 
         * 
         */
        entries(): Array<Array<any>>;
        
        /**
         * Copies values or entries from another collection into this collection, and then returns this.
         * 
         * If the argument is an object that implements `forEach`, for example, most
         * collections including `Map` and `Array`, the behavior of `addEach` varies by
         * whether each involved collection supports keys or indexes.
         * 
         * In the simple cases, values get added in order, and map entries get set in
         * order.
         * 
         * ```js
         * var array = [1, 2, 3, 2, 3, 4];
         * var set = new Set();
         * set.addEach(array);
         * expect(set.toArray()).toEqual([1, 2, 3, 4]);
         * 
         * var map = new Map({a: 10, b: 20});
         * var dict = new Dict();
         * dict.addEach(map);
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20]]);
         * ```
         * 
         * If this collection is a map and the source is not, the source must contain key
         * to value entries, which will then be copied to this map in order.
         * 
         * ```js
         * var list = new List([[0, "a"], [1, "b"], [2, "c"]]);
         * var dict = new Dict();
         * dict.addEach(list);
         * expect(dict.entries()).toEqual([["0", "a"], ["1", "b"], ["2", "c"]]);
         * ```
         * 
         * If the argument is an object that has a length and that length is a number, for
         * example arguments or object literals masquerading as arrays, the object is
         * treated as a map from index to value at that index.
         * 
         * ```js
         * var map = new Map();
         * 
         * function argue() { return arguments; }
         * map.addEach(argue("a", "b", "c"));
         * expect(map.entries()).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
         * 
         * var list = new List();
         * list.addEach(argue(1, 2, 3));
         * expect(list.toArray()).toEqual([1, 2, 3]);
         * 
         * map.addEach({0: "g", 1: "h", 2: "i", length: 3});
         * expect(map.entries()).toEqual([[0, "g"], [1, "h"], [2, "i"]]);
         * ```
         * 
         * After versions `1.1.1` and `2.0.1`, the argument may also be a string and
         * receive
         * the same treatment.
         * 
         * ```js
         * map.addEach("def");
         * expect(map.entries()).toEqual([[0, "d"], [1, "e"], [2, "f"]]);
         * ```
         * 
         * If the argument is any other kind of object, it is treated as a mapping from
         * property name to value, where the property name is the key.
         * If this collection supports keys, the keys will be preserved.
         * 
         * ```js
         * var dict = new Dict();
         * dict.addEach({a: 10, b: 20, c: 30});
         * expect(dict.entries()).toEqual([["a", 10], ["b", 20], ["c", 30]]);
         * ```
         * 
         * Otherwise, the values will be added to this collection in the order they appear.
         * 
         * ```
         * var array = [];
         * array.addEach({a: 10, b: 20, c: 30});
         * expect(array).toEqual([10, 20, 30]);
         * ```
         * 
         * Null and undefined are ignored.
         * Since `addEach` is an implementation detail for all collection constructors,
         * this allows the first argument, the values to copy upon construction, to be
         * elided.
         * 
         * At time of writing, all other values are ignored as well, but the implementors
         * have a free hand to throw a `TypeError` in a future version.
         * 
         * In addition, `Object.addEach(target, source)` behaves in the same fashion as
         * above except the source is used in place of the context object and is treated as
         * a mapping from property names to values.
         * Also, if the source owns a property `forEach`, it is ignored.
         * This makes `addEach` suitable for prototype mixins.
         * 
         * ```js
         * Object.addEach(Set.prototype, GenericCollection.prototype);
         * ```
         * 
         * 
         */
        addEach(valuesOrMap): any;
        
        /**
         * Deletes every value or every value for each key. Returns the number of successful deletions.
         * 
         * If provided an `equals` argument, it will forward that operator to the
         * underlying `delete` implementation, which may or may not be appropriate
         * depending on the collection.
         * 
         * 
         */
        deleteEach(valuesOrKeys, equals?): any;
        
        /**
         * Deletes all of the values in the collection.
         */
        clear(): any;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Aggregates every value in this collection, from right to left.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduceRight` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduceRight` throws
         * an error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduceRight<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns the only value in this collection, or *undefined* if there is more than one value, or if there are no values in the collection.
         * 
         * 
         */
        only(): V;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns a string of all the values in the collection delimited by the given string.
         * 
         * The default delimiter is an empty string.
         * 
         * 
         */
        join(delimiter?: string): string;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Used by `JSON.stringify` to create a JSON representation of the collection.
         * 
         * For most maps this is equivalent to `entries()`, except `Dict` which returns an Object. For sets this is equivalent to `toArray()`.
         * 
         * A collection can be revived by passing the `JSON.parse`d value back into the collection's constructor.
         * 
         * It is important to note that only the collection's contents are serialized to JSON. It is up to you to ensure that when you revive the collection you restore other constraints such as the `equals`, `hash`, or `getDefault` functions.
         * 
         * 
         */
        toJSON(): any;
        
        /**
         * Returns whether this collection is equivalent to the given collection.
         * 
         * In general, collections are equivalent if they have the same content.
         * However, length, order, and uniqueness must also be equivalent if this collection,
         * or the collection on the left for `Object.equals`, discriminate those
         * attributes.
         * 
         * For example, if the left operand is a `List`, `Deque`, or `Array`, order will be
         * significant.
         * If the left operand is a `Set`, uniqueness will matter, but order will not.
         * 
         * The optional second argument is the equality operator to use when comparing the
         * content of these collections, and defaults to `Object.equals`.
         * 
         * 
         */
        equals(value, equals?): boolean;
        
        /**
         * Creates a deep replica of this collection.
         * 
         * Clones values deeply, to the specified depth, using the memo map to connect
         * reference cycles.
         * 
         * The default depth is `Infinity`, in which case, clone will explore every
         * transitive reference of this object graph, producing a mirror image in the clone
         * graph.
         * A depth of *1* signifies a shallow clone, and a depth of *0* signifies no clone
         * at all and this collection returns itself.
         * 
         * The memo is only required to implement `has` and `set`, and accept arbitrary
         * objects for keys.
         * `Map` is sufficient and can be thrown away immediately to recover memory.
         * The map can however serve a secondary purpose of being able to look up an object
         * in the clone graph by its corresponding object in this graph.
         * A memo can also be primed with pre-determined replicas of certain objects,
         * particularly useful for non-clonable objects, or to extend an existing clone
         * graph.
         * The default memo may be a `Map` or `WeakMap`.
         * 
         * Clone will delegate to objects that implement the `clone` method, passing the
         * next depth and the memo.
         * Clone replicates object literals that inherit directly from *Object.prototype*
         * or *null*.
         * However, if an object does is not clonable, `clone` will throw a `TypeError`.
         * 
         * Though `clone` can and should be overridden for specific types, it should be
         * consumed through `Object.clone`, which handles the default depth and memo cases,
         * so clone methods do not need to.
         * 
         * 
         */
        clone(depth?, memo?): any;
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
        /**
         * The `compare` function used by this collection to determine how to order its own values.
         * 
         * 
         */
        contentCompare(left, right): any;
        
        /**
         * The `equals` function used to check whether values in this collection are equivalent.
         * 
         * 
         */
        contentEquals(left, right): any;
        
        /**
         * Adds a listener for when the value for a key changes, or when entries are added or removed.
         * 
         * When the value for a key *changes*, maps will first dispatch a *map will change*
         * notification with the old value followed by a *map change* event with the new
         * value.
         * When a new entry gets *added* to a map, it will first dispatch a *map will
         * change* with undefined, followed by the *map change* with the initial value.
         * When an existing entry is *deleted* from a map, it will first dispatch a *map
         * will change* with the current value, followed by a *map change* with undefined.
         * 
         * As such, it is not possible to distinguish an undefined value from a
         * non-existant value, and it is not possible to capture both the new and old value
         * with a single listener.
         * These problems are addressed in version 2 with a new `observeMapChange`
         * interface.
         * 
         * Map change listeners receive such messages synchronously, as the map changes.
         * 
         * The listener itself can be a function, or a “handler” object.
         * A map change listener function `(value, key, map)`, the same argument pattern
         * familiar from iterator callbacks.
         * 
         * A handler object must implement a method that receives the same arguments, but
         * the name of the method depends on whether your change listener has a name or
         * “token” and whether the change listener is listening for change before or after
         * they take effect.
         * 
         * The `token` argument passed to `addMapChangeListener` dictates the listener’s
         * name, and the `beforeChange` argument (true or false) determines whether the
         * listener is called before or after the change is reflected on the collection.
         * 
         * If the `token` is `"values"` and `beforeChange` is `false`, the handler method
         * name would be `handleValuesMapChange`.
         * If `beforeChange` is `true`, the handler method would be
         * `handleValuesMapWillChange`.
         * If there is no `token`, the handler method would be either `handleMapChange`
         * or `handleMapWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **token** + Map + Change **or** WillChange
         * -   handleMap + Change **or** WillChange
         * -   call
         * 
         * The `collections/map-changes` module exports a map changes **mixin**.
         * The methods of `MapChanges.prototype` can be copied to any collection
         * that needs this interface.  Its mutation methods will need to dispatch
         * the map changes.
         * 
         * To register a will-change listener, use
         * [addBeforeMapChangeListener](add-before-map-change-listener) and avoid using
         * the `beforeChange` boolean argument unless it does in fact depend on a variable
         * with that name, for the sake of readability.
         * 
         * 
         */
        addMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Adds a listener for before map entries are created, deleted, or updated.
         * See [addMapChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Unregisters a map change listener provided by [addMapChangeListener](add-map-change-listener).
         * 
         * 
         */
        removeMapChangeListener(listener, token?, beforeChange?): any;
        
        /**
         * Unregisters a map change listener provided by [addBeforeMapChangeListener](add-before-map-change-listener) or [addMapChangeListener](add-map-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeMapChangeListener(listener, token?): any;
        
        /**
         * Informs map change listeners that an entry was created, deleted, or updated.
         * 
         * Collections that can dispatch map changes call this method to inform listeners.
         * 
         * 
         */
        dispatchMapChange(key, value, beforeChange?): any;
        
        /**
         * Informs map change listeners that an entry will be created, deleted, or updated.
         * 
         * Collections that can dispatch range changes call this method to inform
         * listeners.
         * 
         * 
         * 
         */
        dispatchBeforeMapChange(key, value): any;
        
        /**
         * Adds a listener for an owned property with the given name.
         * 
         * The listener itself can be a function or a “handler” object.
         * The function receives the arguments, `(value, key, object)`, familiar from
         * iterator callbacks.
         * A handler object must implement a method that receives the same arguments.
         * The dispatcher gives precedence to the most specific handler method name.
         * If the name is `Value`, the preferred handler method name is
         * `handleValueChange`, or `handleValueWillChange` if `beforeChange` is true.
         * Otherwise, the dispatcher falls back to the generic `handlePropertyChange` or
         * `handlePropertyWillChange`.
         * 
         * The formula for handler method names gives precedence to the most specific name
         * implemented by the handler:
         * 
         * -   handle + **key** + Change **or** WillChange
         * -   handleProperty + Change **or** WillChange
         * -   call
         * 
         * To register a will-change listener, use
         * [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener)
         * and avoid using the `beforeChange` boolean argument unless it does in fact
         * depend on a variable with that name, for the sake of readability.
         * 
         * 
         */
        addOwnPropertyChangeListener(key, listener, beforeChange?): any;
        
        /**
         * Adds a listener for before a property changes.
         * See [addOwnPropertyChangeListener](add-map-change-listener) for the mechanics of this method, assuming that the `beforeChange` argument is `true`.
         */
        addBeforeOwnPropertyChangeListener(name, listener): any;
        
        /**
         * Unregisters a property change listener provided by [addOwnPropertyChangeListener](add-own-property-change-listener).
         * 
         * 
         */
        removeOwnPropertyChangeListener(name, listener, beforeChange?): any;
        
        /**
         * Unregisters a property change listener provided by [addBeforeOwnPropertyChangeListener](add-before-own-property-change-listener) or [addOwnPropertyChangeListener](add-own-property-change-listener) with the `beforeChange` flag.
         * 
         * 
         */
        removeBeforeOwnPropertyChangeListener(key, listener): any;
        
        /**
         * Informs property change listeners that the value for a property name has changed.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchOwnPropertyChange(key, value, beforeChange?): any;
        
        /**
         * Informs property change listeners that the value for a property name will change.
         * 
         * This method is particularly useful for cases where there is a computed property,
         * defined by a getter, that can change behind the scenes, without assigning to the
         * property itself.
         * Such types must manually dispatch the property change at the point the computed
         * property changes.
         * 
         * 
         */
        dispatchBeforeOwnPropertyChange(key, value): any;
        
        /**
         * May perform internal changes necessary to dispatch property changes for a particular name.
         * 
         * This method is implemented by `Array` since arrays require special consideration
         * to dispatch synchronous change notifications.
         * It can be implemented by any object to make special properties observable.
         * 
         * 
         */
        makePropertyObservable(name): any;
        
    }
    export = SortedArrayMap;
}

declare module "collections/weak-map" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * 
     * A map of object keys to values with good garbage collection behavior.
     * See [WeakMap][].
     * 
     * [WeakMap]: https://github.com/drses/weak-map
     * 
     * 
     */
    class WeakMap<K, V> {
    
        
        
        
        /**
         * Returns whether an entry with the given key exists in a `Map`.
         * 
         * 
         */
        has(key): boolean;
        
        /**
         * Gets the value for a key in a map.
         * 
         * If there is no entry with the request key, and the user calls `get` with a
         * second argument *even if that argument is undefined*, the second argument will
         * be returned instead.
         * Otherwise, `get` will return the result of `getDefault(key)`, which itself
         * defaults to returning undefined.
         * 
         * Every map implementation gives an opportunity to override `getDefault` through
         * the constructor, but it can always be overridden on either the instance or the
         * prototype.
         * It is often useful to provide a `getDefault` that will create, save, and return
         * a default instance for a given key.
         * 
         * ```js
         * var users = new Dict();
         * users.getDefault = function (id) {
         *     var user = new User(id);
         *     this.set(id, user);
         *     return user;
         * };
         * ```
         * 
         * For the purposes of the `get` and `set` methods, an `Array` behaves like a map
         * from index to the value at that index.
         * 
         * ```js
         * var value = [1, 2, 3].get(1);
         * expect(value).toBe(2);
         * ```
         * 
         * In contrast, for the purposes of the `has` method, an `Array` behaves as a list
         * of values.
         * 
         * ```js
         * var found = [1, 2, 3].has(1);
         * expect(found).toBe(true);
         * ```
         * 
         * 
         */
        get(keyOrIndex, defaultReturn?): V;
        
        /**
         * Sets the value for a given key.
         * 
         * 
         */
        set(key, value): any;
        
        /**
         * Deletes the value for a given key. Returns whether the key was found and successfully deleted.
         * 
         * 
         */
        delete(key): any;
        
    }
    export = WeakMap;
}

declare module "collections/iterator" {
    import TreeNode = require("collections/tree-node");
    import ListNode = require("collections/list-node");
    /**
     * Produces values in order on demand.
     * 
     * :warning: Version 2 iterators differ substantially from version 1.
     * This is a description of iterators from version 1, which tracked an earlier
     * version of the ECMAScript iterator proposal.
     * 
     * An iterator is an object with a `next` method that returns the next value for
     * the iterator, or throws `StopIteration`, a global sentinel object for all
     * iterators.
     * `ReturnValue` is a global constructor for instances that inherit from
     * `StopIteration` used to stop an iterator with a return value, particularly
     * useful for generators.
     * The `iterator` module shims these globals if they do not already exist.
     * 
     * An iterable is an object that implements `iterator`.
     * Collections that implement `iterator` may return either an iterator or an
     * `Iterator`.
     * `Iterator` supports additional methods beyond `next`.
     * 
     * 
     */
    class Iterator<V> {
    
        
        
        
        /**
         * Returns an iterator for the respective return values of a callback for each value from this iteration.
         * 
         * The given callback receives the value for each entry, its index, and the
         * iterator itself.
         * 
         * 
         */
        mapIterator<CV>(callback: (value: V, index: number, iterator: Iterator<V>) => CV, thisp?): Iterator<CV>;
        
        /**
         * Returns an iterator for all values from this iterator that pass a test.
         * 
         * THe given callback receives the value for each entry, its index, and the
         * iterator itself.
         * The callback is expected to return a truthy value if the entry is to be
         * retained.
         * The `next` method on the iterator will consume values from this iterator until
         * it finds a value that passes.
         * 
         * 
         */
        filterIterator(callback, thisp?): any;
        
        /**
         * Returns an iterator that will begin with the first value from this iteration that passes a test.
         * 
         * The callback receives a value, its index, and this iterator.
         * The callback is expected to return whether this value should be excluded.
         * Once a value has been included, all subsequent entries from this iteration will
         * pass through.
         * 
         * 
         */
        dropWhile(callback, thisp?): any;
        
        /**
         * Returns an iterator that will produce every value from this iteration until an entry fails a test.
         * 
         * The callback receives a value, its index, and this iterator.
         * The callback is expected to return whether this value should be included.
         * Once a value has been excluded, the returned iteration is done.
         * 
         * 
         */
        takeWhile(callback: (value: V, index: number, iterator: Iterator<V>) => boolean, thisp?): Iterator<V>;
        
        /**
         * Returns an iterator that will produce an array of values with the value at the same index of this iterator and each given iterable.
         * 
         * 
         */
        zipIterator(...iterables): any;
        
        /**
         * Creates an iterator that will produce *[index, value]* for each value in this iterator, on demand.
         * 
         * 
         */
        enumerateIterator(start?): Iterator<Array<any>>;
        
        /**
         * Iterates every value in this collection.
         * 
         * Returns an iterator with the version 1 `Iterator` protocol.
         * 
         * 
         */
        iterateOrIterator(): any;
        
        /**
         * Calls the callback for each entry in the collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * It is not obliged to return anything, and `forEach` returns nothing.
         * 
         * The iteration of lists is resilient to changes to the list during iteration.
         * Nodes added after the current node will be visited.
         * Nodes removed before the current node will not affect subsequent iterations.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        forEach(callback, thisp?): any;
        
        /**
         * Returns an array of the respective return values of a callback for each entry in this collection.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        map<MV>(callback: (v: V, kOrI, c) => MV, thisp?): Array<MV>;
        
        /**
         * Returns an array with each value from this collection that passes the given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * If the return value of the callback is truthy, the value will be included in the
         * resulting array.
         * 
         * The index of the value will be ignored and the resulting array will be compact,
         * even if this collection is an array with holes.
         * Positions in this array that are holes will not be visited.
         * 
         * 
         */
        filter(callback, thisp?): any;
        
        /**
         * Aggregates every value in this collection with the result collected up to that index.
         * 
         * The callback argument is a function that will accept the result collected so
         * far, the value for each entry, the key or index, and the collection itself.
         * Its return value will become the new accumulated result.
         * `reduce` will return the accumulated result upon visiting every index.
         * 
         * The second argument is a `basis`, the aggregate result before any value has been
         * visited, and the ultimate result if this collection is empty.
         * 
         * The `Array` implementation establishes a precedent that the basis should be
         * optional.
         * If the user provides no basis and the collection is empty, `reduce` throws an
         * error.
         * However, at time of writing, all other collections in this library require an
         * initial `basis`.
         * This is a shortcoming that should be rectified in version 2.
         * 
         * `reduce` and `iterate` are the basis for many generic collection methods
         * including `forEach`, `map`, and `filter`.
         * `iterate` is more appropriate for `some` and `every`, which may finish before
         * visiting every entry in the collection.
         * 
         * Also, on `Array`, `reduceRight` does not accept an optional `thisp` argument.
         * Other collections do.
         * 
         * If this collection is an array with holes, those entries will not be visited.
         * 
         * 
         */
        reduce<R>(callback: (result: R, value: V, keyOrIndex, collection) => R, basis: R, thisp?): R;
        
        /**
         * Returns an array of *[key, class]* entries where every value from the collection is placed into the same equivalence class if they return the same key through the given callback.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * 
         * 
         */
        group(callback, thisp?, equals?): any;
        
        /**
         * Returns whether at least one entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard
         * returns a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        some<R>(callback: (value: V, keyOrIndex, collection) => R, thisp?): R;
        
        /**
         * Returns whether any entry in this collection passes a given test.
         * 
         * The given callback receives the value for each entry, the key or index, and the
         * collection itself.
         * `some` stops visiting entries upon reaching an entry for which the guard returns
         * a truthy value, and returns *true*.
         * Otherwise it will return *false*.
         * 
         * 
         */
        every(callback, thisp?): boolean;
        
        /**
         * Returns a sorted array of the values in this collection.
         * 
         * The comparator must be a function that accepts two values and returns a number.
         * 
         * -   less than zero if the left is less than the right
         * -   more than zero if the left is more than the right
         * -   equal to zero if the left is either incomparable or equivalent to the right
         * 
         * A comparator for numbers should subtract the right from the left and expresses
         * both the direction and magnitude of the difference.
         * If the magnitude of the difference is not meaningful, a comparator *should*
         * return only *Infinity*, *-Infinity*, or *0*, to increase the usefulness of the
         * comparator.
         * 
         * The default comparator is `Object.compare`.
         * 
         * 
         */
        sorted(compare?: (left: V, right: V) => number): Array<V>;
        
        /**
         * Returns a copy of this collection with the values in reverse order.
         * 
         * 
         */
        reversed(): any;
        
        /**
         * Returns the sum of all values in this collection.
         * 
         * The zero argument is the initial value to begin accumulating the sum, and
         * defaults to *0*.
         * The sum is aggregated with the plus operator, so an empty string is an equally
         * viable zero for a collection of strings.
         * 
         * 
         */
        sum(zero?): any;
        
        /**
         * Returns the arithmetic mean of the collection, by computing its sum and the count of values and returning the quotient.
         * 
         * The optional zero argument is the initial value for both the sum and count, and
         * defaults to *0*.
         * 
         * Note that for arrays with holes, the count is distinct from the length.
         * 
         * 
         */
        average(): number;
        
        /**
         * Returns the smallest value in this collection.
         * 
         * 
         */
        min(): V;
        
        /**
         * 
         * Returns the largest value in this collection.
         * 
         * 
         */
        max(): V;
        
        /**
         * Returns an array of the respective values in this collection and in each collection provided as an argument.
         * 
         * Thus, if this collection contains numbers and another collection contains
         * corresponding letters, `zip` would return an array of number to letter pairs.
         * 
         * `unzip` is the non-variadic cousin of `zip` and is equivalent to a matrix
         * transpose.
         * 
         * 
         */
        zip(...iterables): any;
        
        /**
         * Returns an array of [index, value] entries for each value in this collection, counting all values from the given index.
         * 
         * The default start index is *0*.
         * 
         * 
         */
        enumerate(start?): Array<Array<any>>;
        
        /**
         * Returns a new collection of the same type containing all the values of itself and the values of any number of other iterable collections in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * For iterators, `concat` constructs a new iterator that will exhaust the values
         * from each iterable in order, starting with this iterator.
         * 
         * `concat` is the variadic cousin of `flatten`.
         * 
         * 
         */
        concat(...iterables): any;
        
        /**
         * Assuming that this is a collection of collections, returns a new collection that contains all the values of each nested collection in order.
         * 
         * For collections that do not allow duplicate values, like `Set`, `concat` will
         * favor the last of all duplicates.
         * For maps, the iterables are treated as map-like objects and each successively
         * updates the result.
         * 
         * Flattening nested arrays is equivalent to concatenating each of them to an empty
         * array.
         * 
         * 
         */
        flatten(): any;
        
        /**
         * Returns an array of each value in this collection.
         * 
         * For a map, this operation is equivalent to calling `values()`.
         * For an array, this is equivalent to calling `slice()`.
         * 
         * 
         */
        toArray(): Array<V>;
        
        /**
         * Returns an object with each property name and value corresponding to the entries in this collection.
         * 
         * For collections that are not maps, the generated property names correspond to
         * each index.
         * 
         * 
         */
        toObject(): {[name: string]: V};
        
        /**
         * Creates a shallow clone of this collection.
         * 
         * `constructClone` is a utility for other generic collection methods, particularly
         * `clone` and `filter`.
         * `constructClone` must invoke its own constructor with the same parameters as
         * were used to construct itself, so a `Set` with a particular hash and
         * equality operator would produce a `Set` with the same operators.
         * 
         * `constructClone` will populate the copy with the given values if provided.
         * 
         * 
         */
        constructClone(values?): any;
        
    }
    export = Iterator;
}



// TODO if these node constructors are not exposed to the user, we should change these classes into interfaces
declare module "collections/list-node" {
    class ListNode<V> {
        constructor(value: V);
        
        addBefore(node: ListNode<V>);
        addAfter(node: ListNode<V>);
        delete();
        
        next: ListNode<V>;
        prev: ListNode<V>;
    }
    export = ListNode;
}

declare module "collections/tree-node" {
    class TreeNode<V> {
        constructor(value: V);

        value: V;
    }
    export = TreeNode;
}
