import { IoMdNotificationsOutline, IoMdMenu } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();


    const handleGoHome = () => {
        if (!user) {
            navigate('/');
            return;
        }

        switch (user.role) {
            case 'Admin':
                navigate('/admin/home');
                break;
            case 'Doctor':
                navigate('/doctor/home');
                break;
            case 'Patient':
                navigate('/patient/home');
                break;
            default:
                navigate('/');
        }
    };

    const handleNotifications = () => {
        // Cuando haga click en el icono muestra la card con notificaciones
    };

    const handleMenuToggle = () => {
        // mostrar boton para logout o perfil
    };

    return (
        <nav className="bg-white flex flex-row items-center justify-between p-1 shadow-md shadow-custom-light-blue text-custom-dark-blue">
            <div className="flex flex-row gap-2 items-center ml-4">
                <img
                    className="w-14 m-2 p-1 rounded-full shadow-2xl hover:scale-110 transition-transform duration-200 cursor-pointer"
                    src="/icono.png"
                    onClick={handleGoHome}
                    alt="Logo" />
                <h1
                    className="font-black text-custom-dark-blue cursor-pointer"
                    onClick={handleGoHome}
                >
                    VITALIS CENTRO MÉDICO
                </h1>
            </div>

            <div className="flex flex-row gap-6 items-center mr-4">
                <IoMdNotificationsOutline
                    size={40}
                    className="hover:scale-110 transition-transform duration-200 cursor-pointer"
                    onClick={handleNotifications}
                />
                <IoMdMenu
                    size={40}
                    className="hover:scale-110 transition-transform duration-200 cursor-pointer"
                    onClick={handleMenuToggle}
                />
            </div>
        </nav>
    );
};

export default Navbar;
