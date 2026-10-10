import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/routes/common/routePath.tsx";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { useLoginMutation } from "@/features/auth/authAPI.ts";
import { useAppDispatch } from "@/app/hook.ts";
import { setCredentials } from "@/features/auth/authSlice.ts";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

const SignInForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => {
    login(values)
      .unwrap()
      .then((data) => {
        dispatch(setCredentials(data));
        toast.success("Login successful");
        setTimeout(() => {
          navigate(PROTECTED_ROUTES.OVERVIEW);
        }, 1000);
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.data?.message || "Failed to login");
      });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("auth-signin-form flex flex-col gap-6", className)}
        {...props}
      >
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
            Welcome back
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Sign in to FinDrive</h1>
          <p className="text-balance text-sm leading-6 text-muted-foreground">
            Your financial picture is just a moment away.
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!font-medium">Email address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      autoComplete="email"
                      className="h-11 rounded-xl border-border/80 bg-background/70 px-3.5 text-sm shadow-none transition-colors focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!font-medium">Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      autoComplete="current-password"
                      className="h-11 rounded-xl border-border/80 bg-background/70 px-3.5 text-sm shadow-none transition-colors focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            disabled={isLoading}
            type="submit"
            className="h-11 w-full rounded-xl bg-emerald-600 font-semibold text-white shadow-[0_8px_24px_-10px_rgba(5,150,105,0.75)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_12px_28px_-10px_rgba(5,150,105,0.8)] focus-visible:ring-emerald-600/30"
          >
            {isLoading && <Loader className="h-4 w-4 animate-spin" />}
            Login
          </Button>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-[var(--bg-color)] dark:bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl border-border/80 bg-background/60 font-medium transition-colors hover:bg-muted/70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Login with GitHub
          </Button>
        </div>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            to={AUTH_ROUTES.SIGN_UP}
            className="font-semibold text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300"
          >
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
};

export default SignInForm;
