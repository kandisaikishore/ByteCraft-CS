import { Domain } from '../types';

export const csDomains: Domain[] = [
  {
    id: 'prog-lang',
    title: 'Programming Languages',
    description: 'Master core execution paradigms, memory management, and OOP designs.',
    icon: 'Terminal',
    accentColor: 'from-amber-500 to-orange-600',
    topics: [
      {
        id: 'memory-mgmt',
        title: 'Memory Management',
        description: 'Deep dive into stack vs heap allocation, pointers, and automatic garbage collection.',
        keyConcepts: ['Stack vs Heap', 'Garbage Collection', 'Reference Counting', 'Memory Leaks'],
        theory: [
          'Memory management is the process of controlling and coordinating computer memory, assigning portions called blocks to various running programs to optimize overall system performance.',
          'Stack Allocation: The stack is a linear data structure used for static memory allocation. Variables allocated on the stack are stored directly to memory and access is very fast. Allocation and deallocation are managed automatically when a function starts and exits using a Last-In, First-Out (LIFO) pattern. The size must be known at compile time.',
          'Heap Allocation: The heap is used for dynamic memory allocation. Variables allocated on the heap have their memory allocated at run time, and accessing this memory is slightly slower. However, the size of heap memory is only limited by your system\'s physical memory, and heap data survives beyond function scopes.',
          'Garbage Collection (GC): Languages like Java, JavaScript, Python, and Go use garbage collectors to automatically clean up dereferenced heap memory. Standard strategies include "Mark-and-Sweep" (mark reachable objects starting from roots, then sweep away unreferenced heap objects) and "Reference Counting" (incrementing a count when referenced, freeing memory when count is zero). GC pauses can impact real-time execution.',
          'Manual Memory Management: Languages like C and C++ require manual developer commands (`malloc`/`free` or `new`/`delete`) to request and release heap memory. Forgetting to free memory creates Memory Leaks, while freeing twice or dereferencing freed pointers causes Dangling Pointers or double-free crashes. Modern languages like Rust use concepts of Ownership and Borrowing, validating memory lifetimes at compile time without a runtime GC.'
        ],
        quiz: [
          {
            id: 'q-mem1',
            question: 'Which of the following is statically allocated and deallocated automatically by the CPU?',
            options: [
              'Heap Memory',
              'Stack Memory',
              'Global Registry',
              'Virtual Disk Page'
            ],
            correctAnswerIndex: 1,
            explanation: 'Variables allocated on the stack are stored directly to memory. CPU manages stack allocation and deallocation automatically and very quickly using LIFO rules.'
          },
          {
            id: 'q-mem2',
            question: 'What is the primary drawback of a runtime Garbage Collector?',
            options: [
              'Manual reclamation of raw bytes',
              'Requires compilation of source templates',
              'Unpredictable runtime performance pauses (stop-the-world)',
              'Restricted to operating only under single-threaded designs'
            ],
            correctAnswerIndex: 2,
            explanation: 'Automatic garbage collection strategies like Mark-and-Sweep require pausing execution briefly ("stop-the-world") to safe-scan heap tables, causing latency spikes.'
          },
          {
            id: 'q-mem3',
            question: 'How does Rust manage heap memory lifetimes safely without a garbage collector?',
            options: [
              'Through static reference counting exclusively at runtime',
              'Through strict compile-time ownership rules and borrowing scopes',
              'Automatically converting all heap items into stack entries',
              'By running an integrated background database process'
            ],
            correctAnswerIndex: 1,
            explanation: 'Rust uses a compile-time ownership system with strict compiler borrow checking. It deallocates memory the moment an owner item goes out of scope, eliminating runtime GC overhead.'
          }
        ]
      },
      {
        id: 'oop-concepts',
        title: 'Object-Oriented Programming (OOP)',
        description: 'Understand encapsulation, inheritance, polymorphism, and solid abstract design patterns.',
        keyConcepts: ['Encapsulation', 'Inheritances', 'Polymorphism', 'SOLID Principles'],
        theory: [
          'Object-Oriented Programming (OOP) is a computer programming model that organizes software design around data, or objects, rather than functions and logic.',
          'Encapsulation: This denotes the wrapping of data (properties) and methods (behaviors) into a single unit (class). It restricts direct client access to an object\'s state, requiring interactions through safe public interfaces (getter/setter methods). This shields internals from invalid states.',
          'Inheritance: The mechanism by which a subclass inherits variables and methods from a superclass. This promotes code reuse. For instance, a `Dog` class might inherit from an `Animal` base class, picking up generic behaviors while specifying custom actions.',
          'Polymorphism: Literally meaning "many forms," polymorphism lets us treat diverse objects as instances of a shared parent type. In static polymorphism (Compile-time / Method Overloading), multiple methods have the same name but different signatures. In dynamic polymorphism (Runtime / Method Overriding), a subclass provides a specific implementation of a method declared in its parent, resolved dynamically at execute-time.',
          'Abstraction: The concept of hiding complex implementations and exposing only essential operations. Interfaces and abstract classes define structural contracts without describing concrete inner mechanics.'
        ],
        quiz: [
          {
            id: 'q-oop1',
            question: 'Which OOP pillar is best demonstrated by declaring private class variables and exposing them via public methods?',
            options: [
              'Inheritance',
              'Polymorphism',
              'Encapsulation',
              'Abstraction'
            ],
            correctAnswerIndex: 2,
            explanation: 'Encapsulation restricts direct user access to state. Wrapping state internally and forcing updates through verified public methods protects class logic integrity.'
          },
          {
            id: 'q-oop2',
            question: 'What is dynamic (runtime) polymorphism primarily resolved by?',
            options: [
              'Method signature overloading',
              'Virtual methods and dynamic dispatch tables (vtables)',
              'Static inline code substitution',
              'Global operating system macro loops'
            ],
            correctAnswerIndex: 1,
            explanation: 'At runtime, languages use dynamic dispatch tables (vtable lookup) to locate the exact overridden method on the subclass instead of executing the parent class template.'
          }
        ]
      }
    ]
  },
  {
    id: 'dsa-domain',
    title: 'Data Structures & Algorithms',
    description: 'Conquer complexity analysis, tree balancing, graph traversals, and dynamic systems.',
    icon: 'Network',
    accentColor: 'from-blue-500 to-indigo-600',
    topics: [
      {
        id: 'big-o-notation',
        title: 'Asymptotic Analysis & Big O',
        description: 'Analyze algorithm performance using rigorous worst-case, best-case, and average-case notation.',
        keyConcepts: ['Time Complexity', 'Space Complexity', 'Amortized Analysis', 'Scalability'],
        theory: [
          'Asymptotic analysis is the mathematical science of estimating the resource consumption (execution time and storage spaces) of algorithms relative to input size N.',
          'Big O Notation (O): Represents the asymptotic upper bound, capturing the worst-case scenario. If an algorithm is O(N²), its execution steps grow no faster than a quadratic curve as the input N approaches infinity.',
          'Omega Notation (Ω): Represents the asymptotic lower bound, or the best-case execution bounds.',
          'Theta Notation (Θ): Defines the tight bound—meaning the algorithm behaves in the specified complexity class consistently across both worst and average cases.',
          'Common rates of growth: O(1) [Constant Time], O(log N) [Logarithmic, e.g., Binary Search], O(N) [Linear], O(N log N) [Linearithmic, e.g., Merge Sort], O(N²) [Quadratic, e.g., Nested Loops], O(2^N) [Exponential, e.g., Naive Fibonacci recursion].'
        ],
        quiz: [
          {
            id: 'q-dsa1',
            question: 'What is the time complexity of searching in a perfectly balanced binary search tree (BST) of size N?',
            options: [
              'O(1)',
              'O(N)',
              'O(log N)',
              'O(N log N)'
            ],
            correctAnswerIndex: 2,
            explanation: 'Each step down a balanced BST eliminates half of the remaining candidates, yielding a logarithmic O(log N) operations path.'
          },
          {
            id: 'q-dsa2',
            question: 'An algorithm has an outer loop running N times, and an inner loop running N times. What is its overall time complexity?',
            options: [
              'O(N + N)',
              'O(N²)',
              'O(2^N)',
              'O(N log N)'
            ],
            correctAnswerIndex: 1,
            explanation: 'The nested iterations mean the inner statement runs N * N times, resulting in a quadratic O(N²) time complexity.'
          }
        ]
      },
      {
        id: 'graphs-traversals',
        title: 'Graphs & Algorithms',
        description: 'Explore topological sorts, Breadth-First, Depth-First, and shortest path mechanisms.',
        keyConcepts: ['Adjacency Lists', 'BFS vs DFS', 'Dijkstra\'s Algorithm', 'Cycle Detection'],
        theory: [
          'A graph is a non-linear data structure comprising a set of vertices (or nodes) joined by edges (which can be directed or undirected, weighted or unweighted).',
          'Graph Representation: Most commonly represented using an Adjacency List (an array of lists, where index i holds neighbors of node i—highly space-efficient for sparse graphs) or an Adjacency Matrix (a 2D Boolean array—fast edge lookups, but consumes O(V²) memory).',
          'Breadth-First Search (BFS): Starts at a designated source node and explores all neighbor vertices at the current depth level before proceeding to vertices at deeper levels. Uses a Queue (FIFO) data structure. Guarantees finding the shortest path in an unweighted graph.',
          'Depth-First Search (DFS): Explores as deep as possible along each vertex branch before backtracking. Uses a Stack (LIFO or recursion). Extremely useful for cycle detection, topological sorting, and finding strongly connected components.',
          'Shortest Paths (Dijkstra\'s): Solves single-source shortest path problems on graphs with non-negative edge weights. It acts as a greedy algorithm utilizing a Min-Priority Queue to repeatedly process node offsets with the smallest estimated distance, achieving O((V + E) log V) complexity.'
        ],
        quiz: [
          {
            id: 'q-graph1',
            question: 'Which data structure is fundamentally used to implement Breadth-First Search (BFS)?',
            options: [
              'Stack',
              'Queue',
              'Binary Tree',
              'Priority Heap'
            ],
            correctAnswerIndex: 1,
            explanation: 'BFS explores layer by layer, matching FIFO flow. A Queue ensures first-discovered vertices are fully expanded first.'
          },
          {
            id: 'q-graph2',
            question: 'What weight constraint does Dijkstra\'s shortest-path algorithm have?',
            options: [
              'Vertices cannot exceed more than 100 edges',
              'Must only operate on undirected grids',
              'Edge weights must be strictly non-negative',
              'All edge weights must equal 1'
            ],
            correctAnswerIndex: 2,
            explanation: 'Dijkstra\'s relies on a greedy strategy where path distances never shrink. Negative edge weights violate this assumption—demanding Bellman-Ford instead.'
          }
        ]
      }
    ]
  },
  {
    id: 'db-domain',
    title: 'Database Technologies',
    description: 'Learn SQL engines, transactions, caching layers, and NoSQL modeling.',
    icon: 'Database',
    accentColor: 'from-emerald-500 to-teal-600',
    topics: [
      {
        id: 'acid-cap',
        title: 'ACID Properties & CAP Theorem',
        description: 'Examine transactional consistency models and distributed database trade-offs.',
        keyConcepts: ['ACID Transactions', 'CAP Theorem', 'Relational vs NoSQL', 'Isolation Levels'],
        theory: [
          'Databases form the persistence engine of applications. Deciding between models requires evaluating consistency guarantees and scaling strategies.',
          'ACID Properties: Ensure relational transaction reliability:\n' +
          '- Atomicity: "All or nothing." If any part of a transaction fails, the entire transaction is rolled back.\n' +
          '- Consistency: Transactions must transition the database from one valid state to another, obeying all schemas and constraints.\n' +
          '- Isolation: Concurrent transactions must execute without cross-contamination. Isolation levels range from Read Uncommitted to Serializable.\n' +
          '- Durability: Once a transaction commits, it remains saved indefinitely, even in a system failure or power loss.',
          'The CAP Theorem: States that in any distributed storage system, you can guarantee at most two out of three of the following:\n' +
          '- Consistency: Every read operation receives the most recent write or an error.\n' +
          '- Availability: Every non-failing node returns a reasonable response (not an error or timeout).\n' +
          '- Partition Tolerance: The system continues to operate despite arbitrary message loss or system network partitions.',
          'In distributed networks, Partition Tolerance (P) is a physical reality that cannot be avoided. Hence, databases must choose between Consistency (CP) or Availability (AP) during a network partition.'
        ],
        quiz: [
          {
            id: 'q-db1',
            question: 'Which ACID property guarantees that once a transaction completes, its adjustments survive a system crash?',
            options: [
              'Atomicity',
              'Consistency',
              'Isolation',
              'Durability'
            ],
            correctAnswerIndex: 3,
            explanation: 'Durability ensures committed data is written directly to non-volatile disks or write-ahead logs to survive subsequent power losses.'
          },
          {
            id: 'q-db2',
            question: 'Under the CAP theorem, since network partitions are inevitable in real-world clusters, what is the core choice left?',
            options: [
              'Scale-up vs Scale-out',
              'Choosing between Consistency and Availability during a split',
              'Restricting user logins vs closing socket servers',
              'Choosing between SQL syntax and JSON payloads only'
            ],
            correctAnswerIndex: 1,
            explanation: 'When a network split occurs, an available node must either answer stale data (A) or refuse to answer (C), forcing a clear API trade-off.'
          }
        ]
      },
      {
        id: 'db-indexing',
        title: 'Indexing & Performance',
        description: 'Analyze structural indices, B-Trees, and query plan optimizations.',
        keyConcepts: ['B-Trees', 'Hash Index', 'Query Planner', 'N+1 Problem'],
        theory: [
          'Without indices, databases must scan every row in a table to find matching entries—a linear O(N) operation that fails at scale.',
          'B-Trees / B+Trees: The default database index structure. B+Trees store data records only in leaf nodes and keep sorted routing keys in internal nodes. This provides high "fan-out" (each node has hundreds of children), keeping the tree structure extremely flat (often 3-4 layers) and optimizing random disk access.',
          'Hash Index: Uses internal hash mappings to look up precise values instantly (O(1)). However, it cannot optimize range queries (e.g., `WHERE age > 18`) because hash keys are randomly distributed.',
          'Index Overhead: While indices greatly accelerate read operations (`SELECT`), they slow down write operations (`INSERT`, `UPDATE`, `DELETE`) because the system must synchronously update the underlying B+Tree structure.'
        ],
        quiz: [
          {
            id: 'q-ind1',
            question: 'Why are B+Trees preferred over standard Binary Search Trees for disk-based database indexes?',
            options: [
              'They keep data records scrambled for faster security',
              'They feature high fan-out, minimizing slow disk read actions',
              'They use less raw memory than small arrays',
              'They don\'t support range queries, which simplifies calculations'
            ],
            correctAnswerIndex: 1,
            explanation: 'B+Trees possess high fan-out, storing thousands of keys per node. This minimizes the height of the index tree, reducing slow physical disk read cycles.'
          }
        ]
      }
    ]
  },
  {
    id: 'web-domain',
    title: 'Web Dev & System Design',
    description: 'Deconstruct HTTP protocols, load balancers, caching strategies, and REST paradigms.',
    icon: 'Globe',
    accentColor: 'from-purple-500 to-pink-600',
    topics: [
      {
        id: 'http-rest',
        title: 'HTTP Protocol & REST API',
        description: 'Examine HTTP methods, headers, MIME types, state rules, and RESTful guidelines.',
        keyConcepts: ['HTTP Codes', 'Statelessness', 'Idempotents Methods', 'JSON Contracts'],
        theory: [
          'Hypertext Transfer Protocol (HTTP) is the client-server application layer protocol powering the World Wide Web.',
          'HTTP methods declare intent:\n' +
          '- GET: Retrieve resources. Idempotent (repeated identical triggers yield identical outcomes) and safe.\n' +
          '- POST: Create a new resource.\n' +
          '- PUT: Replace an existing resource. Idempotent.\n' +
          '- DELETE: Erase a resource. Idempotent.',
          'HTTP Status Categories:\n' +
          '- 100+: Informational.\n' +
          '- 200+: Success (e.g., 200 OK, 201 Created).\n' +
          '- 300+: Redirections.\n' +
          '- 400+: Client Errors (e.g., 400 Bad Request, 401 Unauthorized, 404 Not Found).\n' +
          '- 500+: Server Errors (e.g., 500 Internal Server Error, 503 Service Unavailable).',
          'REST (Representational State Transfer) guidelines enforce standard resource paths (nouns rather than verbs, like `/api/v1/users` instead of `/api/deleteUser`) and leverage standard HTTP methods to achieve clean, stateless APIs.'
        ],
        quiz: [
          {
            id: 'q-web1',
            question: 'Which of the following HTTP methods is NOT idempotent?',
            options: [
              'GET',
              'PUT',
              'DELETE',
              'POST'
            ],
            correctAnswerIndex: 3,
            explanation: 'POST is designed to create new resources. Triggering a POST 5 times will create 5 separate entries, while GET, PUT, and DELETE are idempotent.'
          },
          {
            id: 'q-web2',
            question: 'What does a 409 Conflict HTTP status code typically indicate?',
            options: [
              'The server encountered a fatal database crash',
              'The request was accepted but is pending background processing',
              'A client error showing a conflict with current server state',
              'The requested resource is missing permanently'
            ],
            correctAnswerIndex: 2,
            explanation: '409 indicates a conflict with the server\'s state, such as attempting to create a user profile with an email address that is already registered.'
          }
        ]
      }
    ]
  },
  {
    id: 'ai-domain',
    title: 'Artificial Intelligence & ML',
    description: 'Demystify deep learning, neurons, transformers, self-attention, and LLMs.',
    icon: 'Brain',
    accentColor: 'from-cyan-500 to-blue-600',
    topics: [
      {
        id: 'transformers-attention',
        title: 'Transformers & Large Language Models',
        description: 'Deconstruct Self-Attention networks, Tokenization, and generative foundations.',
        keyConcepts: ['Self-Attention', 'Tokenization', 'Decoder-Only', 'Embedding Space'],
        theory: [
          'Large Language Models (LLMs) are deep-learning models trained on massive text corpora to predict adjacent text markers (tokens).',
          'Self-Attention Mechanism: The core invention of the Transformer architecture (Vaswani et al., 2017). Instead of processing text sequentially like RNNs, Transformers process all words in parallel. Through three matrices—Queries (Q), Keys (K), and Values (V)—each token computes attention weights representing how closely it relates to other tokens in the context window. This allows the model to capture relationship contexts over long text distances.',
          'The Attention Formula:\n' +
          'Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V\n' +
          'Where sqrt(d_k) is a scaling factor to stabilize gradients.',
          'Tokenization: Raw strings are sliced into sub-word tokens (e.g., "ByteCraft" becomes ["Byte", "Craft"]). These represent indices into a vocabulary table, where each token is projected into a high-dimensional vector (Embedding) to capture semantic meanings'
        ],
        quiz: [
          {
            id: 'q-ai1',
            question: 'Why are Transformers highly parallelizable during training compared to prior LSTM/RNN networks?',
            options: [
              'They process input tokens in parallel rather than sequentially step-by-step',
              'They bypass using floating point computations',
              'They restrict training to single-sentence inputs only',
              'They operate exclusively on CPU motherboard caches'
            ],
            correctAnswerIndex: 0,
            explanation: 'Unlike recurrent architectures that must wait for step t-1 before computing step t, Transformers use self-attention to process entire text strings concurrently, optimizing GPU parallelization.'
          },
          {
            id: 'q-ai2',
            question: 'In the Transformer Attention calculation, what is the purpose of the sqrt(d_k) divisor?',
            options: [
              'To encrypt the context payload',
              'To scale activation dot-products to prevent vanishing gradients in softmax',
              'To count the total punctuation characters in the prompt',
              'To translate word tokens into integer values'
            ],
            correctAnswerIndex: 1,
            explanation: 'The divisor sqrt(d_k) scales the dot-product values down. For large dimensions of keys, dot-products grow very large, driving the softmax function into regions with extremely tiny gradients.'
          }
        ]
      }
    ]
  }
];
