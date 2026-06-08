import { ChallengeProblem } from '../types';

export const challenges: ChallengeProblem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    fnName: 'twoSum',
    xpReward: 100,
    starterTemplates: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your code here
    const numMap = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (numMap.has(complement)) {
            return [numMap.get(complement), i];
        }
        numMap.set(nums[i], i);
    }
    return [];
}`,
      python: `def twoSum(nums: list[int], target: int) -> list[int]:
    # Write your Python code here
    pass`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your C++ code here
    }
};`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your Java code here
    }
}`
    },
    testCases: [
      {
        id: 'tc1-1',
        inputs: [[2, 7, 11, 15], 9],
        expected: [0, 1],
        inputDisplay: 'nums = [2, 7, 11, 15], target = 9',
        expectedDisplay: '[0, 1]'
      },
      {
        id: 'tc1-2',
        inputs: [[3, 2, 4], 6],
        expected: [1, 2],
        inputDisplay: 'nums = [3, 2, 4], target = 6',
        expectedDisplay: '[1, 2]'
      },
      {
        id: 'tc1-3',
        inputs: [[3, 3], 6],
        expected: [0, 1],
        inputDisplay: 'nums = [3, 3], target = 6',
        expectedDisplay: '[0, 1]'
      }
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stacks',
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n- Open brackets must be closed by the same type of brackets.\n- Open brackets must be closed in the correct order.\n- Every close bracket has a corresponding open bracket of the same type.',
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only: "()[]{}"'
    ],
    fnName: 'isValid',
    xpReward: 100,
    starterTemplates: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    // Write your code here
    const stack = [];
    const pairs = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    for (let char of s) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else {
            if (stack.length === 0 || stack.pop() !== pairs[char]) {
                return false;
            }
        }
    }
    return stack.length === 0;
}`,
      python: `def isValid(s: str) -> bool:
    # Write your Python code here
    pass`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your C++ code here
    }
};`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Write your Java code here
    }
}`
    },
    testCases: [
      {
        id: 'tc2-1',
        inputs: ['()'],
        expected: true,
        inputDisplay: 's = "()"',
        expectedDisplay: 'true'
      },
      {
        id: 'tc2-2',
        inputs: ['()[]{}'],
        expected: true,
        inputDisplay: 's = "()[]{}"',
        expectedDisplay: 'true'
      },
      {
        id: 'tc2-3',
        inputs: ['(]'],
        expected: false,
        inputDisplay: 's = "(]"',
        expectedDisplay: 'false'
      }
    ]
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray (Kadane\'s)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description: 'Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.\n\nA **subarray** is a contiguous part of an array.',
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    fnName: 'maxSubArray',
    xpReward: 150,
    starterTemplates: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    // Write your code here
    let maxSum = nums[0];
    let currentSum = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`,
      python: `def maxSubArray(nums: list[int]) -> int:
    # Write your Python code here
    pass`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Write your C++ code here
    }
};`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Write your Java code here
    }
}`
    },
    testCases: [
      {
        id: 'tc3-1',
        inputs: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]],
        expected: 6,
        inputDisplay: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        expectedDisplay: '6' // Subarray is [4,-1,2,1] has the largest sum = 6
      },
      {
        id: 'tc3-2',
        inputs: [[1]],
        expected: 1,
        inputDisplay: 'nums = [1]',
        expectedDisplay: '1'
      },
      {
        id: 'tc3-3',
        inputs: [[5, 4, -1, 7, 8]],
        expected: 23,
        inputDisplay: 'nums = [5, 4, -1, 7, 8]',
        expectedDisplay: '23'
      }
    ]
  },
  {
    id: 'reverse-list',
    title: 'Reverse a Linked List',
    difficulty: 'Easy',
    category: 'Linked Lists',
    description: 'Given the values of a singly-linked list in an array pattern `head`, reverse the list and return the reversed array of values.\n\n(Note: To simplify browser-based evaluation, the inputs and outputs are simulated as JavaScript array structures of nodes, but represents the classic structure of links).',
    constraints: [
      'The number of nodes in the list is in the range [0, 5000]',
      '-5000 <= Node.val <= 5000'
    ],
    fnName: 'reverseList',
    xpReward: 100,
    starterTemplates: {
      javascript: `/**
 * @param {number[]} head
 * @return {number[]}
 */
function reverseList(head) {
    // Write your code here
    return head.slice().reverse();
}`,
      python: `def reverseList(head: list[int]) -> list[int]:
    # Write your Python code here
    pass`,
      cpp: `class Solution {
public:
    vector<int> reverseList(vector<int>& head) {
        // Write your C++ code here
    }
};`,
      java: `class Solution {
    public int[] reverseList(int[] head) {
        // Write your Java code here
    }
}`
    },
    testCases: [
      {
        id: 'tc4-1',
        inputs: [[1, 2, 3, 4, 5]],
        expected: [5, 4, 3, 2, 1],
        inputDisplay: 'head = [1, 2, 3, 4, 5]',
        expectedDisplay: '[5, 4, 3, 2, 1]'
      },
      {
        id: 'tc4-2',
        inputs: [[1, 2]],
        expected: [2, 1],
        inputDisplay: 'head = [1, 2]',
        expectedDisplay: '[2, 1]'
      },
      {
        id: 'tc4-3',
        inputs: [[]],
        expected: [],
        inputDisplay: 'head = []',
        expectedDisplay: '[]'
      }
    ]
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    category: 'Algorithms',
    description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.',
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All the integers in nums are unique.',
      'nums is sorted in ascending order.'
    ],
    fnName: 'search',
    xpReward: 100,
    starterTemplates: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
    // Write your code here
    let left = 0;
    let right = nums.length - 1;
    while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}`,
      python: `def search(nums: list[int], target: int) -> int:
    # Write your Python code here
    pass`,
      cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        // Write your C++ code here
    }
};`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        // Write your Java code here
    }
}`
    },
    testCases: [
      {
        id: 'tc5-1',
        inputs: [[-1, 0, 3, 5, 9, 12], 9],
        expected: 4,
        inputDisplay: 'nums = [-1, 0, 3, 5, 9, 12], target = 9',
        expectedDisplay: '4'
      },
      {
        id: 'tc5-2',
        inputs: [[-1, 0, 3, 5, 9, 12], 2],
        expected: -1,
        inputDisplay: 'nums = [-1, 0, 3, 5, 9, 12], target = 2',
        expectedDisplay: '-1'
      }
    ]
  }
];
