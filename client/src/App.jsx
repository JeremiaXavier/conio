import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Send,
  Brain,
  Moon,
  Sun,
  User,
  Loader2,
  MessageSquare,
  LogOut,
  Mail,
  Lock,
} from "lucide-react";
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// Auth Component
const AuthScreen = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onAuthSuccess();
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleEmailAuth();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
              <Brain size={24} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Conio
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Your intelligent AI companion
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 outline-none focus:border-purple-400 dark:focus:border-purple-500 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 outline-none focus:border-purple-400 dark:focus:border-purple-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              onClick={handleEmailAuth}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <span>{isLogin ? "Sign In" : "Sign Up"}</span>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/50 dark:bg-gray-900/50 text-gray-500">
                  or
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2 hover:border-gray-400 dark:hover:border-gray-600"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-8">
          © {new Date().getFullYear()} JeremiaXavier Corporation
        </p>
      </div>
    </div>
  );
};

// Welcome Screen Component
const WelcomeScreen = () => (
  <div className="flex-1 flex items-center justify-center px-6 animate-fade-in">
    <div className="text-center max-w-2xl">
      <div className="mb-8 relative inline-block">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="relative flex items-center justify-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
            <Brain size={32} className="text-white" />
          </div>
          <h1 className="text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            Conio
          </h1>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
        Your intelligent AI companion
      </p>
      <div className="flex items-center justify-center space-x-3 text-gray-500 dark:text-gray-500">
        <MessageSquare size={20} />
        <span className="text-sm">Start a conversation below</span>
      </div>
    </div>
  </div>
);

// Message Component
const ChatMessage = ({ message, user }) => {
  const isUser = message.role === "user";
  const photo = user.photoURL;
console.log(user)
  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-8 animate-fade-in`}
    >
      <div
        className={`max-w-3xl ${
          isUser ? "items-end" : "items-start"
        } flex flex-col`}
      >
        <div
          className={`flex items-start space-x-3 ${
            isUser ? "flex-row-reverse space-x-reverse" : ""
          }`}
        >
          {!isUser && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Brain size={16} className="text-white" />
            </div>
          )}
          <div className="flex-1">
            <p
              className={`text-base leading-relaxed ${
                isUser
                  ? "text-gray-800 dark:text-gray-200"
                  : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {message.content}
            </p>
            {message.error && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  <strong>Error:</strong> {message.error}
                </p>
              </div>
            )}
          </div>
          {isUser && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              {photo ? (
                // 🚀 Case 1: Profile picture is available
                <img
                  src={photo}
                  alt="User Profile"
                 referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                // 👤 Case 2: Fallback icon is used (your original code)
                <div
                  // Add the gradient background ONLY for the fallback state
                  className="w-full h-full rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center"
                >
                  <User
                    size={16}
                    className="text-gray-700 dark:text-gray-300"
                  />
                </div>
              )}{" "}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Thinking Indicator Component
const ThinkingIndicator = () => (
  <div className="flex justify-start mb-8 animate-fade-in">
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
        <Brain size={16} className="text-white" />
      </div>
      <div className="flex items-center space-x-2 mt-1">
        <div
          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  </div>
);

// Header Component
const ChatHeader = ({ theme, onToggleTheme, user, onSignOut }) => (
  <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/80 dark:bg-black/50 backdrop-blur-xl ">
    <div className="max-w-5xl mx-auto flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <Brain size={16} className="text-white" />
        </div>
        <h1 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Conio
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        {user && (
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800/50">
            <User size={14} className="text-gray-600 dark:text-gray-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {user.email}
            </span>
          </div>
        )}

        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-110"
        >
          {theme === "dark" ? (
            <Sun size={18} className="text-gray-700 dark:text-gray-300" />
          ) : (
            <Moon size={18} className="text-gray-700 dark:text-gray-300" />
          )}
        </button>

        {user && (
          <button
            onClick={onSignOut}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800/50 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 transform hover:scale-110"
            title="Sign Out"
          >
            <LogOut
              size={18}
              className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
            />
          </button>
        )}
      </div>
    </div>
  </header>
);

// Chat Messages Container Component
const ChatMessages = ({
  messages,
  isThinking,
  chatWindowRef,
  user = { user },
}) => (
  <main ref={chatWindowRef} className="flex-1 overflow-y-auto md:mb-28 px-6 pt-24 pb-6">
    <div className="max-w-3xl mx-auto ">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} user={user} />
      ))}
      {isThinking && <ThinkingIndicator />}
    </div>
  </main>
);

// Input Area Component
const ChatInput = ({
  input,
  isThinking,
  inputRef,
  onInputChange,
  onSendMessage,
  onKeyPress,
}) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white via-white/95 dark:from-black dark:via-black/95 to-transparent">
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={onInputChange}
          onKeyPress={onKeyPress}
          placeholder="Ask me anything..."
          disabled={isThinking}
          className="w-full px-6 py-4 pr-14 rounded-2xl bg-gray-100 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 outline-none focus:border-purple-400 dark:focus:border-purple-500/50 transition-all duration-300 disabled:opacity-50"
        />
        <button
          onClick={onSendMessage}
          disabled={isThinking || input.trim() === ""}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <Send size={18} />
        </button>
      </div>
    </div>

    {/* Footer */}
    <div className=" py-4">
      <p className="text-center text-xs text-gray-500 dark:text-gray-500">
        © {new Date().getFullYear()} JeremiaXavier Corporation. All rights
        reserved.
      </p>
    </div>
  </div>
);

// Global Styles Component
const GlobalStyles = () => (
  <style>{`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.5s ease-out;
    }
    @keyframes pulse-slow {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.5; }
    }
    .animate-pulse-slow {
      animation: pulse-slow 3s ease-in-out infinite;
    }
    @keyframes gradient {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    .animate-gradient {
      background-size: 200% 200%;
      animation: gradient 3s ease infinite;
    }
  `}</style>
);

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [authChecking, setAuthChecking] = useState(true);
  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthChecking(false);
    });
    return unsubscribe;
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setMessages([]);
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleSendMessage = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || isThinking) return;

    const userMessage = { id: Date.now(), role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      // Get the ID token from the current user
      const idToken = await user.getIdToken();

      const apiUrl = "http://localhost:5000/api/chat-server";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          userId: user?.uid || "anonymous",
        }),
      });

      const data = await response.json();
      let aiMessage;

      if (response.ok && data.text) {
        aiMessage = {
          id: Date.now() + 1,
          role: "ai",
          content: data.text,
          error: null,
        };
      } else if (data.error) {
        aiMessage = {
          id: Date.now() + 1,
          role: "ai",
          content: `Could not process your request.`,
          error: data.error,
        };
      } else {
        throw new Error("Network or unexpected server response.");
      }

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Fetch Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: "ai",
        content:
          "Failed to connect to the server. Please check the backend console.",
        error: error.message,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, isThinking, user]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Show loading while checking auth
  if (authChecking) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-purple-500" />
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <AuthScreen onAuthSuccess={() => {}} />;
  }

  // Show chat interface
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      <GlobalStyles />

      {/* Animated background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <ChatHeader
          theme={theme}
          onToggleTheme={toggleTheme}
          user={user}
          onSignOut={handleSignOut}
        />

        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <ChatMessages
            messages={messages}
            isThinking={isThinking}
            chatWindowRef={chatWindowRef}
            user={user}
          />
        )}

        <ChatInput
          input={input}
          isThinking={isThinking}
          inputRef={inputRef}
          onInputChange={handleInputChange}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  );
};

export default App;
