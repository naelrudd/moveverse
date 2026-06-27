import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{ background: "red", minHeight: "100vh" }}>
      <h1 style={{ color: "white" }}>TEST PAGE</h1>
      <SignIn />
    </div>
  );
}
