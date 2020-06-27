var cred = {
    SecretKey : "",
    SecretId : ""
};
var Bucket = 'colew';
var Region =  'ap-beijing';
var filePosition = 'upload/';

function myencode(str) {
    var key = "";
    var l = key.length;
    var a = key.split("");
    var s = "",b, b1, b2, b3;
    for (var i = 0; i <str.length; i ++) {
        b = str.charCodeAt(i);
        b1 = b % l;
        b = (b - b1) / l;
        b2 = b % l;
        b = (b - b2) / l;
        b3 = b % 1;
        s += a[b3] + a[b2] + a[b1];
    }
    return s;
}

function mydecode(str) {
    var key = "";
    var l = key.length;
    var b, b1, b2, b3, d = 0, s;
    s = new Array(Math.floor(str.length / 3));
    b = s.length;
    for (var i = 0; i < b; i ++) {
        b1 = key.indexOf(str.charAt(d));
        d ++;
        b2 = key.indexOf(str.charAt(d));
        d ++;
        b3 = key.indexOf(str.charAt(d));
        d ++;
        s[i] = b1 * l * l + b2 * l + b3
    }
    b = eval("String.fromCharCode(" + s.join(',') + ")");
    return b ;
}
