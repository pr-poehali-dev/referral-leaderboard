import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="w-full border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex gap-4">
        <Link to="/">
          <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Главная
          </button>
        </Link>
        <Link to="/test">
          <button className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors">
            Тест 1
          </button>
        </Link>
        <Link to="/test2">
          <button className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors">
            Тест 2
          </button>
        </Link>
        <Link to="/contest-ended">
          <button className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors">
            Конкурс завершен
          </button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
