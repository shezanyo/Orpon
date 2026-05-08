import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    login(email || name);
    navigate("/dashboard");
  };

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="text-xl font-bold">Create your Orpon account</h1>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" />
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email address" />
        <Button className="w-full" type="submit">
          Register
        </Button>
      </form>
    </Card>
  );
}
