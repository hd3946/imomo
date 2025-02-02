import { Button } from "@repo/ui/components/ui/button";

export function Hero() {
  return (
    <section className="container flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center text-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          안녕하세요,
          <br />
          프론트엔드 개발자입니다
        </h1>
        <p className="text-muted-foreground text-lg">
          창의적인 웹 경험을 만드는 것을 좋아합니다
        </p>
        <Button size="lg">프로젝트 보기</Button>
      </div>
    </section>
  );
}
