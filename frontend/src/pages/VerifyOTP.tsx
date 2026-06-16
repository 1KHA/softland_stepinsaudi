import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOTP() {

const navigate = useNavigate();
const location = useLocation();

const email = location.state?.email;
const formData = location.state?.formData;

const [otp, setOtp] = useState("");
const [loading, setLoading] = useState(false);
const [sending, setSending] = useState(false);

const [seconds, setSeconds] = useState(35);

const isLogin =
location.state?.isLogin;

const isReset =
location.state?.isResetPassword;

useEffect(() => {

if (!email) {

navigate("/login");

}

}, [email, navigate]);

useEffect(() => {

if (seconds <= 0)
return;

const timer =
setInterval(() => {

setSeconds(
(s) => s - 1
);

}, 1000);

return () =>
clearInterval(
timer
);

}, [seconds]);

const formatTime =
() => {

const min =
Math.floor(
seconds / 60
);

const sec =
seconds % 60;

return `${min}:${sec
.toString()
.padStart(
2,
"0"
)}`;

};

const verifyOTP =
async () => {

if (!otp) {

alert(
"ادخلي رمز التحقق"
);

return;

}

setLoading(
true
);

try {

const endpoint =
isReset
?

"http://localhost:3000/auth/reset-password"

:

isLogin

?

"http://localhost:3000/auth/verify-login-otp"

:

"http://localhost:3000/auth/verify-register-otp";
const res =
await fetch(
endpoint,
{

method:
"POST",

headers: {

"Content-Type":
"application/json"

},

body:
JSON.stringify(

isReset

?

{

email,

otp,

password:
location
.state
?.password

}

:

{

email,

otp

}

)

}
);

const data =
await res.json();

if (
res.ok
) {

if (
!isReset &&
data.token
) {

localStorage.setItem(
"token",
data.token
);

}

if (
!isReset &&
data.user
) {

localStorage
.setItem(

"user",

JSON.stringify(
data.user
)

);

}

if (
isReset
) {

alert(
"تم تغيير كلمة المرور"
);

navigate(
"/login"
);

}

else {

const role =
data.user?.role;

console.log(
"OTP ROLE =",
role
);

if (
role === "ADMIN"
) {

navigate(
"/admin"
);

}

else if (
role === "CLIENT"
) {

navigate(
"/company-dashboard"
);

}

else {

navigate(
"/employee-dashboard"
);

}

}

}

else {

alert(
data.message
||
"فشل التحقق"
);

}

}

catch (
err
) {

console.log(
err
);

alert(
"خطأ في التحقق"
);

}

setLoading(
false
);

};

const resendOTP =
async () => {

setSending(
true
);

try {

const endpoint =

isReset

?

"http://localhost:3000/auth/forgot-password"

:

isLogin

?

"http://localhost:3000/auth/login"

:

"http://localhost:3000/auth/register-with-company";
const body =

isReset

?

{
email
}

:

isLogin

?

{
email,

password:
location
.state
?.password
}

:

formData;
const res =
await fetch(
endpoint,
{

method:
"POST",

headers: {

"Content-Type":
"application/json"

},

body:
JSON.stringify(
body
)

}
);

const data =
await res.json();

if (
res.ok
) {

setSeconds(
35
);

alert(
"تم إرسال رمز جديد"
);

}

else {

alert(
data.message
);

}

}

catch {

alert(
"فشل إعادة الإرسال"
);

}

setSending(
false
);

};

return (

<div className="min-h-screen bg-brand-cream flex items-center justify-center px-4">

<motion.div
initial={{
opacity:0,
y:20
}}

animate={{
opacity:1,
y:0
}}

className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md"

>

<button
onClick={() =>
navigate(
"/login"
)
}
className="mb-6"

>

<ArrowLeft />

</button>

<div className="text-center">

<div className="w-16 h-16 rounded-full bg-brand-gold/10 mx-auto flex items-center justify-center">

<Mail className="text-brand-gold"/>

</div>

<h1 className="mt-5 text-3xl font-bold">

Verify Email

</h1>

<p className="text-gray-500 mt-2">

تم إرسال رمز التحقق إلى

</p>

<p className="font-semibold">

{email}

</p>

</div>

<input

value={otp}

onChange={(e)=>
setOtp(
e.target.value
)
}

maxLength={6}

placeholder="000000"

className="mt-8 w-full border rounded-xl p-4 text-center text-3xl tracking-[10px]"

/>

<div className="text-center mt-4">

{

seconds > 0

?

(

<p className="text-gray-500">

إعادة الإرسال بعد :

<b className="ml-2">

{

formatTime()

}

</b>

</p>

)

:

(

<button

onClick={
resendOTP
}

disabled={
sending
}

className="text-brand-gold font-bold"

>

{

sending

?

"جارٍ الإرسال..."

:

"إعادة إرسال"

}

</button>

)

}

</div>

<button

onClick={
verifyOTP
}

disabled={
loading
}

className="mt-6 w-full bg-brand-gold rounded-xl py-4 font-bold"

>

{

loading

?

"جارٍ التحقق..."

:

"تأكيد"

}

</button>

</motion.div>

</div>

);

}
