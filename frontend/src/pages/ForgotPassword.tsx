import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {

const navigate =
useNavigate();

const [email, setEmail] =
useState("");

const [loading, setLoading] =
useState(false);

const sendOTP =
async () => {

if (!email) {

alert(
"ادخلي البريد الإلكتروني"
);

return;

}

setLoading(true);

try {

const res =
await fetch(
"http://localhost:3000/auth/forgot-password",
{

method:
"POST",

headers: {

"Content-Type":
"application/json"

},

body:
JSON.stringify({

email

})

}

);

const data =
await res.json();

if (
res.ok &&
data.requiresOTP
) {

navigate(
"/new-password",
{

state: {

email

}

}

);

return;

}

alert(
data.message
||
"فشل الإرسال"
);

}

catch (
err
) {

console.log(
err
);

alert(
"خطأ في الاتصال"
);

}

setLoading(false);

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

Forgot Password

</h1>

<p className="text-gray-500 mt-2">

أدخلي البريد الإلكتروني لإرسال رمز التحقق

</p>

</div>

<input

type="email"

value={email}

onChange={(e)=>
setEmail(
e.target.value
)
}

placeholder="example@gmail.com"

className="mt-8 w-full border rounded-xl p-4"

dir="ltr"

/>

<button

onClick={
sendOTP
}

disabled={
loading
}

className="
mt-6
w-full
bg-brand-gold
rounded-xl
py-4
font-bold
"

>

{

loading

?

"جارٍ الإرسال..."

:

"إرسال رمز التحقق"

}

</button>

</motion.div>

</div>

);

}