type LogoutButtonProps = {
  label?: string;
};

export function LogoutButton({ label = "Sair" }: LogoutButtonProps) {
  return (
    <form action="/api/auth/logout" method="post" className="logout-form">
      <button type="submit" className="logout-button">
        {label}
      </button>
    </form>
  );
}
