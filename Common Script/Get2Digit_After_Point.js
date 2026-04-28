

function toFixedTrunc(x, n)
{
    const v = (typeof x === 'string' ? x : x.toString()).split('.');
    if (n <= 0) return v[0];
    let f = v[1] || '';
    if (f.length > n) return `${v[0]}.${f.substr(0, n)}`;
    while (f.length < n) f += '0';
    return `${v[0]}.${f}`
}
var x = 5.6798;
var n = 2;
var number = toFixedTrunc(x, n);
console.log("Number : " + number);


