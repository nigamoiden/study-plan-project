import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Lộ trình riêng cho bạn",
    description:
      "Bắt đầu từ mục tiêu, khối lớp, học lực và thời gian bạn có thể dành cho việc học.",
  },
  {
    number: "02",
    title: "Học theo từng ngày",
    description:
      "Chia mục tiêu lớn thành các nhiệm vụ kiến thức và luyện tập nhỏ, dễ theo dõi.",
  },
  {
    number: "03",
    title: "Theo dõi tiến độ",
    description:
      "Lưu kết quả và nhiệm vụ đã hoàn thành để bạn biết mình đang tiến bộ ra sao.",
  },
];

const steps = [
  "Chia sẻ mục tiêu và thói quen học tập",
  "Nhận lộ trình học phù hợp",
  "Học, luyện tập và theo dõi tiến độ",
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaff] text-slate-950">
      <header className="relative z-10 border-b border-violet-100/80 bg-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Minh Nhật Béo - Trang chủ">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-700 text-lg font-black text-white">
              M
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              minh nhật <span className="text-violet-700">béo</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-violet-700">
              Tính năng
            </a>
            <a href="#how-it-works" className="transition hover:text-violet-700">
              Cách hoạt động
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-violet-50 hover:text-violet-800 sm:px-4"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-violet-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 sm:px-5"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute -right-32 -top-20 h-96 w-96 rounded-full bg-violet-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-36 bottom-0 h-80 w-80 rounded-full bg-fuchsia-100/70 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3.5 py-2 text-sm font-semibold text-violet-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Học có kế hoạch, tiến bộ mỗi ngày
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Biến mục tiêu học tập thành{" "}
              <span className="text-violet-700">kế hoạch rõ ràng.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Minh Nhật Béo giúp bạn xác định mục tiêu, sắp xếp việc học thành từng
              bước nhỏ và theo dõi tiến độ của chính mình.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 font-bold text-white shadow-lg shadow-violet-700/20 transition hover:-translate-y-0.5 hover:bg-violet-800"
              >
                Tạo lộ trình miễn phí
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-700 transition hover:border-violet-200 hover:text-violet-800"
              >
                Tìm hiểu cách hoạt động
              </a>
            </div>
            <p className="mt-5 text-sm text-slate-500">
              Bắt đầu bằng việc thiết lập mục tiêu và thói quen học tập của bạn.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -left-5 top-10 h-24 w-24 rounded-3xl bg-amber-200/80 rotate-[-12deg]" />
            <div className="absolute -bottom-5 right-4 h-28 w-28 rounded-full bg-fuchsia-200/80" />
            <div className="relative rounded-[2rem] border border-violet-100 bg-white p-5 shadow-2xl shadow-violet-950/10 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-violet-700">LỘ TRÌNH CỦA BẠN</p>
                  <h2 className="mt-2 text-2xl font-extrabold">Từng bước một</h2>
                  <p className="mt-1 text-sm text-slate-500">Một ngày học hiệu quả</p>
                </div>
                <div className="rounded-2xl bg-violet-50 px-3 py-2 text-center">
                  <p className="text-xs font-semibold text-violet-600">HÔM NAY</p>
                  <p className="mt-0.5 text-lg font-extrabold text-violet-800">03</p>
                </div>
              </div>

              <div className="mt-7 space-y-3">
                <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                    ✓
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800">Ôn lại kiến thức trọng tâm</p>
                    <p className="mt-1 text-sm text-slate-500">Toán học · 20 phút</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">XONG</span>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-violet-200 bg-white p-4 shadow-sm">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-700 text-sm font-bold text-white">
                    2
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800">Luyện tập theo chủ đề</p>
                    <p className="mt-1 text-sm text-slate-500">Toán học · 25 phút</p>
                  </div>
                  <span className="h-3 w-3 rounded-full bg-violet-500 ring-4 ring-violet-100" />
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-400">
                    3
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-500">Ghi chú điều cần xem lại</p>
                    <p className="mt-1 text-sm text-slate-400">Tổng kết · 10 phút</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-gradient-to-r from-violet-700 to-fuchsia-600 p-4 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-violet-100">Tiến độ tuần này</p>
                    <p className="mt-1 text-xl font-extrabold">Bạn đang giữ nhịp tốt!</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white/30 text-sm font-extrabold">
                    3/5
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 rounded-2xl border border-violet-100 bg-white px-4 py-3 shadow-xl sm:block">
              <p className="text-xs font-semibold text-slate-500">MỤC TIÊU</p>
              <p className="mt-1 font-extrabold text-slate-800">Tiến bộ mỗi ngày ✨</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-slate-100 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700">
              Học tập chủ động
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Một kế hoạch phù hợp tạo nên khác biệt
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Tập trung vào điều bạn cần học, theo nhịp độ bạn có thể duy trì.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="rounded-3xl border border-slate-200 bg-[#fdfcff] p-7 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-950/5"
              >
                <p className="text-sm font-extrabold text-violet-600">{feature.number}</p>
                <h3 className="mt-4 text-xl font-extrabold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700">
              Bắt đầu đơn giản
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Từ mục tiêu đến hành động mỗi ngày
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Thiết lập hồ sơ học tập một lần, sau đó theo dõi các nhiệm vụ và
              kết quả ngay trên bảng điều khiển của bạn.
            </p>
          </div>
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={step} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 font-extrabold text-violet-800">
                  {index + 1}
                </span>
                <span className="font-bold text-slate-800">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-300">
            Bắt đầu hành trình của bạn
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black sm:text-4xl">
            Sẵn sàng học tập có kế hoạch hơn?
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
            Tạo tài khoản để thiết lập mục tiêu và xây dựng lộ trình học tập của riêng bạn.
          </p>
          <Link
            href="/register"
            className="mt-7 inline-flex rounded-xl bg-white px-6 py-3.5 font-bold text-slate-950 transition hover:bg-violet-100"
          >
            Bắt đầu ngay
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Minh Nhật Béo</p>
          <p>Lập kế hoạch tốt hơn. Học tập chủ động hơn.</p>
        </div>
      </footer>
    </main>
  );
}
