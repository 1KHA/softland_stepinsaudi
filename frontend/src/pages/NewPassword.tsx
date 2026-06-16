import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function NewPassword() {

const navigate =
useNavigate();

const location =
useLocation();

const email =
location.state?.email;

const [password, setPassword] =
useState("");

const [loading, setLoading] =
useState(false);

const continueToOTP =
() => {

if (!password) {

alert(
"أدخل كلمة المرور الجديدة"
);

return;

}

navigate(
"/verify-otp",
{

state: {

email,

password,

isResetPassword:
true

}

}

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

<Lock className="text-brand-gold"/>

</div>

<h1 className="mt-5 text-3xl font-bold">

New Password

</h1>

<p className="text-gray-500 mt-2">

أدخل كلمة المرور الجديدة

</p>

</div>

<input

type="password"

value={password}

onChange={(e)=>
setPassword(
e.target.value
)
}

placeholder="********"

className="mt-8 w-full border rounded-xl p-4"

/>

<button

onClick={
continueToOTP
}

disabled={
loading
}

className="mt-6 w-full bg-brand-gold rounded-xl py-4 font-bold"

>

Continue

</button>

</motion.div>

</div>

);

}