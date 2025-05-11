import { Avatar } from '../shared/Avatar';

interface HeaderProps {
  user: {
    name: string;
    role: string;
    image?: string;
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-8">
        {/* <h1 className="text-2xl font-semibold text-[#0B8FAC]">Dashboard</h1> */}
      </div>
      
      <div className="flex items-center gap-3">
      <Avatar 
          name={user.name}
          image={user.image}
          size="md"
        />
        <div className="text-left">
          <div className="font-medium text-[#0B8FAC]">{user.name}</div>
          <div className="text-sm text-gray-600">{user.role}</div>
        </div>

      </div>
    </header>
  );
}