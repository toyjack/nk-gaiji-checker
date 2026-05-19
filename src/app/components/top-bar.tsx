import Link from "next/link";

type TopBarProps = {
  sourceFile: string;
  recordCount: number;
};

export default function TopBar({ sourceFile, recordCount }: TopBarProps) {
  return (
    <section className="mx-auto mb-5 flex max-w-[1500px] flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase text-base-content/60">
          日国外字レビュープロトタイプ
        </p>
        <h1 className="text-3xl font-bold">Unicode字形適合性チェックツール</h1>
      </div>
      <div className="grid grid-span-2 justify-end gap-2 text-sm text-base-content/70">
        <div className="flex justify-between">
          <span>{sourceFile}</span>
          <span className="badge badge-neutral">
            {recordCount.toLocaleString()} 件
          </span>
        </div>
        <div className="flex justify-between">
          <span className="badge badge-outline">作成者：劉冠偉</span>
          <Link
            className="link link-primary"
            href="mailto:liuguanwei2013@gmail.com"
          >
            liuguanwei2013@gmail.com
          </Link>
        </div>
      </div>
    </section>
  );
}
