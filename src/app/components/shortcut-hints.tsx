export default function ShortcutHints() {
  return (
    <div
      className="flex flex-wrap gap-2 text-xs text-base-content/70"
      aria-label="キーボードショートカット"
    >
      <span className="badge badge-outline gap-1">
        <kbd className="kbd kbd-xs">1</kbd> 適合
      </span>
      <span className="badge badge-outline gap-1">
        <kbd className="kbd kbd-xs">2</kbd> 不適合
      </span>
      <span className="badge badge-outline gap-1">
        <kbd className="kbd kbd-xs">3</kbd> 要確認
      </span>
      <span className="badge badge-outline gap-1">
        <kbd className="kbd kbd-xs">N</kbd>/<kbd className="kbd kbd-xs">→</kbd> 次へ
      </span>
      <span className="badge badge-outline gap-1">
        <kbd className="kbd kbd-xs">P</kbd>/<kbd className="kbd kbd-xs">←</kbd> 前へ
      </span>
    </div>
  );
}
