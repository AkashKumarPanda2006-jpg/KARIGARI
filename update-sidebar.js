const fs = require('fs');
let fileContent = fs.readFileSync('src/app/admin/dashboard/page.tsx', 'utf8');

if (!fileContent.includes('lucide-react')) {
    fileContent = fileContent.replace(
        'import Image from "next/image";',
        `import Image from "next/image";\nimport { LayoutDashboard, Users, Package, ShieldAlert, ScrollText } from "lucide-react";`
    );
}

const oldSidebar = `<aside className="fixed left-0 top-0 h-full w-64 glass-panel z-50 flex flex-col !rounded-none !border-l-0 !border-t-0 !border-b-0">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-zari-gold rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
          <span className="font-headline-md text-primary tracking-tighter">KARIGARI</span>
        </div>
        <div className="flex-1 px-4 py-4">
          <div className="mb-8">
            <h3 className="px-4 mb-4 text-xs font-label-lg text-outline uppercase tracking-widest">Management</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/admin/dashboard" className="flex items-center px-4 py-3 rounded-xl transition-all bg-tertiary text-white shadow-lg">
                <span className="font-label-lg">Registry Overview</span>
              </Link>
              <Link href="/admin/users" className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/30 transition-all">
                <span className="font-label-lg">Artisan Directory</span>
              </Link>
              <Link href="/admin/verify" className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/30 transition-all">
                <span className="font-label-lg">Certification Hub</span>
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="px-4 mb-4 text-xs font-label-lg text-outline uppercase tracking-widest">System</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/admin/dashboard" className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/30 transition-all">
                <span className="font-label-lg">Security Logs</span>
              </Link>
              <Link href="/admin/dashboard" className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/30 transition-all">
                <span className="font-label-lg">System Integrity</span>
              </Link>
            </nav>
          </div>
        </div>
        <div className="p-6 border-t border-glass-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm border border-glass-border flex items-center justify-center text-secondary font-bold">LM</div>
            <div className="flex flex-col">
              <span className="font-label-lg text-on-surface">Loom Master</span>
              <span className="text-xs text-outline">Super Admin</span>
            </div>
          </div>
        </div>
      </aside>`;

const newSidebar = `<aside className="fixed left-0 top-0 h-full w-64 glass-panel z-50 flex flex-col !rounded-none !border-l-0 !border-t-0 !border-b-0">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-zari-gold rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)] flex items-center justify-center font-bold text-white text-xs">K</div>
          <span className="font-headline-md text-primary tracking-widest">KARIGARI</span>
        </div>
        <div className="flex-1 px-4 py-4">
          <div className="mb-8">
            <nav className="flex flex-col gap-2">
              <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-primary/20 text-primary shadow-sm border border-primary/10">
                <LayoutDashboard size={20} />
                <span className="font-label-lg">Dashboard</span>
              </Link>
              <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/50 transition-all">
                <Users size={20} />
                <span className="font-label-lg">User Management</span>
              </Link>
              <Link href="/admin/verify" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/50 transition-all">
                <Package size={20} />
                <span className="font-label-lg">Verify Batch</span>
              </Link>
              <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/50 transition-all">
                <ShieldAlert size={20} />
                <span className="font-label-lg">Counterfeit Alerts</span>
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="px-4 mb-4 text-[10px] font-label-lg text-outline uppercase tracking-widest font-bold">SYSTEM</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/50 transition-all">
                <ScrollText size={20} />
                <span className="font-label-lg">Audit Log</span>
              </Link>
            </nav>
          </div>
        </div>
        <div className="p-6 border-t border-glass-border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">A</div>
            <div className="flex flex-col">
              <span className="font-label-lg text-on-surface font-bold">Admin User</span>
              <span className="text-xs text-outline">Pochampally Coop</span>
            </div>
          </div>
        </div>
      </aside>`;

fileContent = fileContent.replace(oldSidebar, newSidebar);
fs.writeFileSync('src/app/admin/dashboard/page.tsx', fileContent);
console.log('Sidebar updated');
