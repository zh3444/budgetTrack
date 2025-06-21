import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";

import { login } from "./api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await login({email, password});
      console.log(' login ', res);
      if (res.status === 200) {
        toast.success(`Welcome, ${res.username}!`);
        navigate('/home');
      } else if (res.status === 401) {
        toast.error("Invalid email or password!");
      }
    } catch (error) {
      toast.error("Login failed. ", error);
    }   
  }

  return (
    <div className="min-h-screen min-w-screen flex justify-center items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            Login to your account
          </CardTitle>
          <CardDescription>
            Enter your email below to login to your account. 
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {/* TODO: reset password feature */}
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                  Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button className="w-full" onClick={handleLogin}>
            Login
          </Button>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">Don't have an account?{" "}
              <Link to="/register" className="underline text-primary hover:opacity-80">
                Sign up here
              </Link>
            </p>
          </CardFooter>
        </CardFooter>
      </Card>
    </div>
  );
}
