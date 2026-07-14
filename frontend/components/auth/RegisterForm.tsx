export default function RegisterForm() {
  return (
    <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-8">
      <h1 className="mb-6 text-center text-3xl font-bold text-white">
        Create Account
      </h1>

      <form className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white outline-none"
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white outline-none"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-yellow-500 py-3 font-semibold text-black"
        >
          Register
        </button>
      </form>
    </div>
  );
}