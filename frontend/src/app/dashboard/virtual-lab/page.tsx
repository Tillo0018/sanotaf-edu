import VirtualLab from "@/components/VirtualLab";

export const metadata = {
  title: 'Virtual Laboratoriya | Dashboard',
};

export default function DashboardVirtualLabPage() {
  return (
    <div className="flex-1 p-8 overflow-y-auto w-full">
      <VirtualLab />
    </div>
  );
}
