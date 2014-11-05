"use strict";

var __hasProp = {}.hasOwnProperty;

export interface GraphNode<N> {
    id: string;
    data?: N;
}

interface PrivateGraphNode<N, E> extends GraphNode<N> {
    _outEdges: {
        [s: string]: PrivateGraphEdge<N, E>;
    };
    _inEdges: {
        [s: string]: PrivateGraphEdge<N, E>;
    };
}

export interface GraphEdge<N, E> {
    data?: E;
    weight: number;
    fromNode: GraphNode<N>;
    toNode: GraphNode<N>;
}

interface PrivateGraphEdge<N, E> extends GraphEdge<N, E> {
    fromNode: PrivateGraphNode<N, E>;
    toNode: PrivateGraphNode<N, E>;
}

/**
 * Graph implemented as a modified incidence list. O(1) for every typical
 * operation except `removeNode()` at O(E) where E is the number of edges.

 * *# Overview example:

 * ```js
 * var graph = new Graph;
 * graph.addNode('A'); // => a node object. For more info, log the output or check
 * // the documentation for addNode
 * graph.addNode('B');
 * graph.addNode('C');
 * graph.addEdge('A', 'C'); // => an edge object
 * graph.addEdge('A', 'B');
 * graph.getEdge('B', 'A'); // => undefined. Directed edge!
 * graph.getEdge('A', 'B'); // => the edge object previously added
 * graph.getEdge('A', 'B').weight = 2 // weight is the only built-in handy property
 * // of an edge object. Feel free to attach
 * // other properties
 * graph.getInEdgesOf('B'); // => array of edge objects, in this case only one;
 * // connecting A to B
 * graph.getOutEdgesOf('A'); // => array of edge objects, one to B and one to C
 * graph.getAllEdgesOf('A'); // => all the in and out edges. Edge directed toward
 * // the node itself are only counted once
 * forEachNode(function(nodeObject) {
 * console.log(node);
 * });
 * forEachEdge(function(edgeObject) {
 * console.log(edgeObject);
 * });
 * graph.removeNode('C'); // => 'C'. The edge between A and C also removed
 * graph.removeEdge('A', 'B'); // => the edge object removed
 * ```

 * *# Properties:

 * - nodeSize: total number of nodes.
 * - edgeSize: total number of edges.
 */
export class Graph<N, E> {

    private _nodes: {
        [s: string]: PrivateGraphNode<N, E>
    };
    
    private _id;

    nodeSize: number;
    edgeSize: number;

    constructor() {
        this._nodes = {};
        this.nodeSize = 0;
        this.edgeSize = 0;
        this._id = 0;
    }
    
    private _nextId() {
        return '' + this._id++;
    }

    addNode(id: string = this._nextId(), data?: N): GraphNode<N> {

        /*
         The `id` is a unique identifier for the node, and should **not** change
         after it's added. It will be used for adding, retrieving and deleting
         related edges too.

         **Note** that, internally, the ids are kept in an object. JavaScript's
         object hashes the id `'2'` and `2` to the same key, so please stick to a
         simple id data type such as number or string.

         _Returns:_ the node object. Feel free to attach additional custom properties
         on it for graph algorithms' needs. **Undefined if node id already exists**,
         as to avoid accidental overrides.
         */
        if(!this._nodes[id]) {
            this.nodeSize++;
            return this._nodes[id] = {
                id: id,
                _outEdges: {},
                _inEdges: {},
                data: data
            };
        }
    }

    getNode(id: string): GraphNode<N> {

        /*
         _Returns:_ the node object. Feel free to attach additional custom properties
         on it for graph algorithms' needs.
         */
        return this._nodes[id];
    }

    removeNode(id: string): GraphNode<N> {

        /*
         _Returns:_ the node object removed, or undefined if it didn't exist in the
         first place.
         */
        var inEdgeId, nodeToRemove, outEdgeId, _ref, _ref1;
        nodeToRemove = this._nodes[id];
        if(!nodeToRemove) {
            return;
        } else {
            _ref = nodeToRemove._outEdges;
            for(outEdgeId in _ref) {
                if(!__hasProp.call(_ref, outEdgeId)) continue;
                this.removeEdge(id, outEdgeId);
            }
            _ref1 = nodeToRemove._inEdges;
            for(inEdgeId in _ref1) {
                if(!__hasProp.call(_ref1, inEdgeId)) continue;
                this.removeEdge(inEdgeId, id);
            }
            this.nodeSize--;
            delete this._nodes[id];
        }
        return nodeToRemove;
    }

    addEdge(fromId: string, toId: string, weight?: number, data?: E): GraphEdge<N, E> {
        var edgeToAdd: PrivateGraphEdge<N, E>, fromNode, toNode;
        if(weight == null) {
            weight = 1;
        }

        /*
         `fromId` and `toId` are the node id specified when it was created using
         `addNode()`. `weight` is optional and defaults to 1. Ignoring it effectively
         makes this an unweighted graph. Under the hood, `weight` is just a normal
         property of the edge object.

         _Returns:_ the edge object created. Feel free to attach additional custom
         properties on it for graph algorithms' needs. **Or undefined** if the nodes
         of id `fromId` or `toId` aren't found, or if an edge already exists between
         the two nodes.
         */
        if(this.getEdge(fromId, toId)) {
            return;
        }
        fromNode = this._nodes[fromId];
        toNode = this._nodes[toId];
        if(!fromNode || !toNode) {
            return;
        }
        edgeToAdd = {
            weight: weight,
            data: data,
            fromNode: fromNode,
            toNode: toNode
        };
        fromNode._outEdges[toId] = edgeToAdd;
        toNode._inEdges[fromId] = edgeToAdd;
        this.edgeSize++;
        return edgeToAdd;
    }

    getEdge(fromId: string, toId: string): GraphEdge<N, E> {

        /*
         _Returns:_ the edge object, or undefined if the nodes of id `fromId` or
         `toId` aren't found.
         */
        var fromNode, toNode;
        fromNode = this._nodes[fromId];
        toNode = this._nodes[toId];
        if(!fromNode || !toNode) {

        } else {
            return fromNode._outEdges[toId];
        }
    }

    removeEdge(fromId: string, toId: string): GraphEdge<N, E> {

        /*
         _Returns:_ the edge object removed, or undefined of edge wasn't found.
         */
        var edgeToDelete, fromNode, toNode;
        fromNode = this._nodes[fromId];
        toNode = this._nodes[toId];
        edgeToDelete = this.getEdge(fromId, toId);
        if(!edgeToDelete) {
            return;
        }
        delete fromNode._outEdges[toId];
        delete toNode._inEdges[fromId];
        this.edgeSize--;
        return edgeToDelete;
    }

    getInEdgesOf(nodeId: string): Array<GraphEdge<N, E>> {

        /*
         _Returns:_ an array of edge objects that are directed toward the node, or
         empty array if no such edge or node exists.
         */
        var fromId, inEdges, toNode, _ref;
        toNode = this._nodes[nodeId];
        inEdges = [];
        _ref = toNode != null ? toNode._inEdges : void 0;
        for(fromId in _ref) {
            if(!__hasProp.call(_ref, fromId)) continue;
            inEdges.push(this.getEdge(fromId, nodeId));
        }
        return inEdges;
    }

    getOutEdgesOf(nodeId: string): Array<GraphEdge<N, E>> {

        /*
         _Returns:_ an array of edge objects that go out of the node, or empty array
         if no such edge or node exists.
         */
        var fromNode, outEdges, toId, _ref;
        fromNode = this._nodes[nodeId];
        outEdges = [];
        _ref = fromNode != null ? fromNode._outEdges : void 0;
        for(toId in _ref) {
            if(!__hasProp.call(_ref, toId)) continue;
            outEdges.push(this.getEdge(nodeId, toId));
        }
        return outEdges;
    }

    getAllEdgesOf(nodeId: string): Array<GraphEdge<N, E>> {

        /*
         **Note:** not the same as concatenating `getInEdgesOf()` and
         `getOutEdgesOf()`. Some nodes might have an edge pointing toward itself.
         This method solves that duplication.

         _Returns:_ an array of edge objects linked to the node, no matter if they're
         outgoing or coming. Duplicate edge created by self-pointing nodes are
         removed. Only one copy stays. Empty array if node has no edge.
         */
        var i, inEdges, outEdges, selfEdge, _i, _ref, _ref1;
        inEdges = this.getInEdgesOf(nodeId);
        outEdges = this.getOutEdgesOf(nodeId);
        if(inEdges.length === 0) {
            return outEdges;
        }
        selfEdge = this.getEdge(nodeId, nodeId);
        for(i = _i = 0, _ref = inEdges.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            if(inEdges[i] === selfEdge) {
                _ref1 = [inEdges[inEdges.length - 1], inEdges[i]], inEdges[i] = _ref1[0], inEdges[inEdges.length - 1] = _ref1[1];
                inEdges.pop();
                break;
            }
        }
        return inEdges.concat(outEdges);
    }

    /**
     * Traverse through the graph in an arbitrary manner, visiting each node once.
     * Pass a function of the form `fn(nodeObject, nodeId)`.
     * 
     * Returning false from operation will terminate iteration early.
     * 
     * _Returns:_ undefined.
     */
    forEachNode(operation: (node: GraphNode<N>, nodeId: string) => any) {

        var nodeId, nodeObject, _ref;
        _ref = this._nodes;
        for(nodeId in _ref) {
            if(!__hasProp.call(_ref, nodeId)) continue;
            nodeObject = _ref[nodeId];
            if(operation(nodeObject, nodeId) === false) return;
        }
    }
    
    forEachSource(operation: (node: GraphNode<N>, nodeId: string) => any) {
        var nodeId, nodeObject;
        var nodes = this._nodes;
        // For each node
        for(nodeId in nodes) {
            if(!__hasProp.call(nodes, nodeId)) continue;
            nodeObject = nodes[nodeId];
            // Count the number of incoming edges
            var inEdges = nodeObject._inEdges;
            hasIncomingEdge:
            do {
                for(var edgeId in inEdges) {
                    if(__hasProp.call(inEdges, edgeId)) {
                        // This node has an incoming edge; abort immediately
                        break hasIncomingEdge;
                    }
                }
                // This node does not have any incoming edges; invoke the callback
                if(operation(nodeObject, nodeId) === false) return;
            } while(false);
        }
    }
    
    forEachSink(operation: (node: GraphNode<N>, nodeId: string) => any) {
        var nodeId, nodeObject;
        var nodes = this._nodes;
        // For each node
        for(nodeId in nodes) {
            if(!__hasProp.call(nodes, nodeId)) continue;
            nodeObject = nodes[nodeId];
            // Count the number of incoming edges
            var outEdges = nodeObject._outEdges;
            hasOutgoingEdge:
                do {
                    for(var edgeId in outEdges) {
                        if(__hasProp.call(outEdges, edgeId)) {
                            // This node has an outgoing edge; abort immediately
                            break hasOutgoingEdge;
                        }
                    }
                    // This node does not have any outgoing edges; invoke the callback
                    if(operation(nodeObject, nodeId) === false) return;
                } while(false);
        }
    }

    /**
     * Traverse through the graph in an arbitrary manner, visiting each edge once.
     * Pass a function of the form `fn(edgeObject)`.
     *
     * _Returns:_ undefined.
     */
    forEachEdge(operation: (edge: GraphEdge<N, E>) => any) {

        var edgeObject, nodeId, nodeObject, toId, _ref, _ref1;
        _ref = this._nodes;
        for(nodeId in _ref) {
            if(!__hasProp.call(_ref, nodeId)) continue;
            nodeObject = _ref[nodeId];
            _ref1 = nodeObject._outEdges;
            for(toId in _ref1) {
                if(!__hasProp.call(_ref1, toId)) continue;
                edgeObject = _ref1[toId];
                if(operation(edgeObject) === false) return;
            }
        }
    }
    
    findCycle(): Array<GraphEdge<N, E>> {
        return findCycle(this);
    }
}

interface FindCycleScope <N, E> {
    currNode: GraphNode<N>;
    currEdges?: Array<GraphEdge<N, E>>;
    currEdgesIndex?: number;
    ret: () => any;
}

export function findCycle<N, E>(graph: Graph<N, E>): Array<GraphEdge<N, E>> {
    function findLoops(node: GraphNode<N>) {
        // State shared across invocations of the algorithm
        var edges: Array<GraphEdge<N, E>> = [];
        var visited: {
            [id: string]: boolean;
        } = {};
        var visitedInPath: typeof visited = {};
        
        // Simulation of the stack and local scope:
        // one object for each invocation of the algorithm, simulating a function's local scope
        var stack: Array<FindCycleScope<N, E>> = [];
        var this_: FindCycleScope<N, E>;
        
        // Entry point of the algorithm.  Every invocation of the algorithm starts here.
        var _entryPoint = startNode;

        // Call the algorithm (equivalent to a function call in normal recursion)
        return callAlgo({
            currNode: node,
            currEdges: null,
            currEdgesIndex: 0,
            ret: failed
        });
        
        //////////////
        // Recursion simulation helpers
        
        // Call this every time you want to recurse.  Pass it a scope object.
        function callAlgo(scope: FindCycleScope<N, E>) {
            this_ = scope;
            stack.push(scope);
            return _entryPoint;
        }

        // return from the algorithm (equivalent to a `return` statement in normal recursion)
        function returnAlgo() {
            var ret = stack.pop().ret;
            this_ = stack[stack.length - 1];
            return ret;
        }
        
        //////////////
        // Implementation of the algorithm
        
        function startNode() {
            if(visitedInPath[this_.currNode.id]) {
                // we already visited this node in the current path of edges
                // That means we've found a loop!
                return locateStartOfLoop;
            }
            
            // else we have not yet visited this node
            visited[this_.currNode.id] = true;
            visitedInPath[this_.currNode.id] = true;
            this_.currEdges = graph.getOutEdgesOf(this_.currNode.id);
            this_.currEdgesIndex = 0;
            return lookAtEdge;
        }

        function lookAtEdge() {
            if(this_.currEdgesIndex >= this_.currEdges.length)
                return endNode;
            var nextEdge = this_.currEdges[this_.currEdgesIndex];
            edges.push(nextEdge);
            // Recurse to the new node we've found by following this edge
            return callAlgo({
                currNode: nextEdge.toNode,
                ret: goToNextEdge
            });
        }
        
        function goToNextEdge() {
            // We just finished exploring the node at the end of an edge
            edges.pop();
            this_.currEdgesIndex++;
            return lookAtEdge;
        }

        function endNode() {
            delete visitedInPath[this_.currNode.id];
            return returnAlgo();
        }
        
        function locateStartOfLoop(): any {
            // Locate the start of the loop
            for(var i = 0; edges[i].fromNode !== this_.currNode; i++) {}
            return edges.slice(i);
        }
        
        function failed() {
            // We finished traversing all edges and did not find a loop
            return null;
        }
    }
    
    // Invokes its argument (`fn`), and invokes the return value from that invocation, and so on and so on...
    // until the return value is not a function.
    // Then, it returns that value.
    function trampoline(fn) {
        while(typeof fn === 'function') {
            fn = fn();
        }
        return fn;
    }
    
    var ret = null;
    graph.forEachNode((node) => {
        ret = trampoline(findLoops(node));
        if(ret) return false;
    });
    return ret || null;
}


