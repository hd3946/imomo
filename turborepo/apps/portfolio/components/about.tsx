export function About() {
  return (
    <section className="container py-24" id="about">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold">About Me</h2>
          <p className="text-muted-foreground">
            안녕하세요! 저는 3년차 프론트엔드 개발자입니다. 사용자 경험을
            개선하고 효율적인 웹 애플리케이션을 만드는 것에 열정을 가지고
            있습니다.
          </p>
          <p className="text-muted-foreground">
            현재는 React, TypeScript, Next.js를 주로 사용하여 개발하고 있으며,
            새로운 기술을 학습하고 적용하는 것을 좋아합니다.
          </p>

          <div className="flex flex-col gap-2 mt-4">
            <h3 className="text-xl font-semibold">경력</h3>
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="font-medium">시니어 프론트엔드 개발자</h4>
                <p className="text-sm text-muted-foreground">
                  회사명 • 2022 - 현재
                </p>
              </div>
              <div>
                <h4 className="font-medium">주니어 프론트엔드 개발자</h4>
                <p className="text-sm text-muted-foreground">
                  회사명 • 2020 - 2022
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative aspect-square rounded-full border-2">
          <img
            src="/profile.jpg"
            alt="Profile"
            className="rounded-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
