import { Schema, model } from "mongoose";

const signupCodeSchema = Schema({
  code: { type: Number, required: true },
  email: { type: String, required: true },
  expiry: { type: Date, required: true },
});

const SignUpCode = model("SignupCode", signupCodeSchema);

export default SignUpCode;
