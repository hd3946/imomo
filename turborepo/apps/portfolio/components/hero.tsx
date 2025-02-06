const HoverTextEffect = ({ text }: { text: string }) => {
  return (
    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-white">
      {text.split(" ").map((char, index) => (
        <span key={index} className="inline-block text-bounce-hover">
          {char}
        </span>
      ))}
    </h1>
  );
};

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-purple-500 blur-3xl opacity-20"></div>
      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        <HoverTextEffect text="Hey there!" />
        <HoverTextEffect text="I'm a Frontend Developer crafting unique web experiences." />

        <p className="text-lg text-gray-300">
          I love building interactive and visually appealing UIs.
        </p>
      </div>
    </section>
  );
}
