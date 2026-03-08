import BloggoForgotPasswordSection from "@/views/BloggoSignIn/components/BloggoForgotPasswordSection";

export const metadata = {
  title: "Forgot password",
  description: "Reset your Bloggo password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6 py-10 bg-white">
      <BloggoForgotPasswordSection />
    </div>
  );
}
