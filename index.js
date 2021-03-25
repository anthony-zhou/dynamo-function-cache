// Examples for the `withCache` function wrapper.

const cache = require('./function-cache');

/* Imagine this is a very slow API call
  * or complex calculation */
function slowAPICall(name) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(`Hello, ${name}!`);
    }, 10000);
  });
}

async function slowFunction(name) {
  if (!name) {
    return "Please provide a valid name.";
  }

  return slowAPICall(name);
}

/* Imagine this is another very slow API call
  * or complex calculation */
function slowAdditionPromise(x, y, z) {
  const result = x + y + z;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(result);
    }, 10000);
  });
}

async function slowAddition(x, y, z) {
  return slowAdditionPromise(x, y, z);
}



// Example 1: calling a function with one parameter
function example1() {
  const cachedFunction = cache.withCache('SLOW_FUNCTION', slowFunction);

  cachedFunction('Jacob')
    .then((greeting) => {
      console.log(greeting);
    })
}


// Example 2: calling a function with multiple parameters
function example2() {
  const anotherCachedFunction = cache.withCache('ADDITION', slowAddition);

  anotherCachedFunction(1, 2, 3)
    .then((result) => {
      console.log(result);
    })
}

// example1();
example2();