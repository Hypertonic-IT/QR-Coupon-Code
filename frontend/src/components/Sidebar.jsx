"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  LayoutDashboard,
  Users,
  Download,
  LogOut,
  KeyRound,
  Sparkles,
} from "lucide-react";

const nav = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "QR Codes", href: "/admin/qr", icon: QrCode },
  { label: "Generate Codes", href: "/admin/qr/generate", icon: Sparkles },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Change Password", href: "/admin/change-password", icon: KeyRound },
];

const actions = [
  {
    label: "Export CSV",
    href: "/api/admin/export-csv",
    icon: Download,
    external: true,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <QrCode size={16} color="white" />
        </div>
        <div>
          <div className="sidebar-logo-name">CashbackQR</div>
          <div className="sidebar-logo-tag">Management Portal</div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="sidebar-group">
        <div className="sidebar-group-label">Main Menu</div>
        {nav.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`sb-item${active ? " active" : ""}`}
            >
              <span className="sb-icon">
                <Icon size={16} />
              </span>
              {label}
            </Link>
          );
        })}
      </div>

      {/* Actions */}
      <div className="sidebar-group">
        <div className="sidebar-group-label">Actions</div>
        {actions.map(({ label, href, icon: Icon, external }) =>
          external ? (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="sb-item"
            >
              <span className="sb-icon">
                <Icon size={16} />
              </span>
              {label}
            </a>
          ) : (
            <Link key={label} href={href} className="sb-item">
              <span className="sb-icon">
                <Icon size={16} />
              </span>
              {label}
            </Link>
          ),
        )}
      </div>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <div className="sb-user">
          <div className="sb-user-avatar">A</div>
          <div>
            <div className="sb-user-name">Administrator</div>
            <div className="sb-user-role">Super Admin</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sb-item"
          style={{ color: "#ef4444" }}
        >
          <span className="sb-icon">
            <LogOut size={15} />
          </span>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
