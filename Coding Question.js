// ----------------------- Remove duplicate from an array code ------------------------------

let test = [1, 6, 9, 3, 6, 1, 6, 45, 90, 3];
let freshArry = [...new Set(test)];
console.log(freshArry)
// -------------------------------------------------------------------------------------------------

// -------------------------------- Count frequency of each element in the array ------------------------

const array = ['a', 'b', 'a', 'c', 'b', 'a'];
// const array = ['apple', 'ball', 'apple', 'all', 'ball', 'aow'];
const countObj = {};
array.forEach((item) => {
    countObj[item] = (countObj[item] || 0) + 1
})
console.log(countObj)
// OutPut : {
//   aow: 1,
//   apple: 2,
//   ball: 3
// }

// ---------------------------------------------------------------------------------------------------------

// ------------------------------ Count the frequency of each character in a string -----------------------------

const input = "Apple";
const countInputObj = {};
for (let index = 0; index < input.length; index++) {

    countInputObj[input[index]] = (countInputObj[input[index]] || 0) + 1
}
console.log(countInputObj)
//Output :
// {
//   A: 1,
//   e: 1,
//   l: 1,
//   p: 2
// }

// ---------------------------------------------------------------------------------------------------------

// ------------------------------ Second Largest Element in an Array -----------------------------

const testArry = [2, 54, 5, 14, 90, 90]
const descendingArray = testArry.sort((a, b) => b - a);
const outputArray = [...new Set(descendingArray)]
console.log(outputArray[1]) // Output 54
// If you want the second lowest elemnt of an array
// console.log(outputArray[outputArray.length - 2])  // Output 5

// ---------------------------------------------------------------------------------------------------------

//  ----------------------------- Remove All Occurrences of an Element in an Array ----------------------

let arr = [0, 1, 3, 0, 2, 2, 4, 2];
let element = 2;
let outputArr = [];
for (let index = 0; index < arr.length; index++) {
    if (arr[index] != element) {
        outputArr.push(arr[index])
    }
}
console.log(outputArr.length) //5

// ---------------------------------------------------------------------------------------------------------

//  ----------------------------- Given an integer array, find a maximum product of a triplet in the array. ----------------------

// let tripletArr = [-10, -3, -5, -6, -20]
let tripletArr = [10, 3, 5, 6, 20]
tripletArr.sort((a, b) => b - a);
console.log(tripletArr[0] * tripletArr[1] * tripletArr[2])
// Output: 1200
// Explanation: Multiplication of 10, 6 and 20
// ---------------------------------------------------------------------------------------------------------------------------


// ---------------------------- Maximum consecutive one’s or zeros in a binary array --------------------------
let consecutiveArr = [0, 1, 0, 1, 1, 1, 1]; //[0, 0, 0, 1, 0, 1, 0]//
let maxCount = 0, count = 1;
for (let index = 1; index < consecutiveArr.length; index++) {
    if (consecutiveArr[index] == consecutiveArr[index - 1]) {
        count++
    }
    else {
        maxCount = Math.max(maxCount, count)
        count = 1;
    }
}
console.log(Math.max(maxCount, count))


// Print Prime Number 

function isPrime(num) {
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
            return false;
        }
    }
    return num > 1;
}

function printPrimeNumbers(n) {
    for (let i = 2; i <= n; i++) {
        if (isPrime(i)) {
            console.log(i);
        }
    }
}

printPrimeNumbers(100);