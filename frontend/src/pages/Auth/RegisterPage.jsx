import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerValidationSchema } from "../../validations/authSchemas";
import { useToast } from "../../hooks/useToast";

import PrincipalCard from "../../components/ui/PrincipalCard";
import Input from "../../components/ui/Input";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import Button from "../../components/ui/Button";

import { createPatient } from "../../../services/patient.service";

const RegisterPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    dni: "",
    telephone: "",
    birthDate: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const inputPassswordType = showPassword ? "text" : "password";
  const passwordIcon = showPassword ? (
    <FaRegEyeSlash size={25} />
  ) : (
    <FaRegEye size={25} />
  );

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const inputConfirmPassswordType = showConfirmPassword ? "text" : "password";
  const confirmPasswordIcon = showConfirmPassword ? (
    <FaRegEyeSlash size={25} />
  ) : (
    <FaRegEye size={25} />
  );

  const handleToLogin = () => {
    navigate("/");
  };

  const updateFormData = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const rule = registerValidationSchema[name];
    if (rule) {
      const error = rule(value, formData);
      setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    for (const name in registerValidationSchema) {
      const value = formData[name];
      const rule = registerValidationSchema[name];
      const error = rule(value, formData);
      if (error) {
        newErrors[name] = error;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();

    if (isValid) {
      setLoading(true);
      const { confirmPassword, confirmEmail, name, lastname, telephone, birthDate, email, password, dni } = formData;

      const dataForService = {
        dni: dni,
        firstName: name,
        lastName: lastname,
        telephone: telephone,
        birthDate: birthDate,
        email: email,
        password: password,
      };


      try {
        const result = await createPatient(dataForService, []);
        toast.success("¡Cuenta de paciente creada exitosamente! Por favor, inicia sesión.");

        setTimeout(() => {
          handleToLogin();
        }, 1500);

      } catch (error) {
        console.error("Error al registrar paciente:", error);

        let errorMessage = "Ocurrió un error al intentar registrarse.";

        if (error.detail) {
          errorMessage = `Error: ${error.detail}`;
        }
        else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }

        toast.error(errorMessage);

      } finally {
        setLoading(false);
      }

    } else {
      toast.warning("Por favor, corrige los errores en el formulario.");
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prevShow) => !prevShow);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword((prevShow) => !prevShow);
  };

  const registerContent = (
    <form
      className="flex flex-col items-center justify-center h-full w-xl"
      onSubmit={handleOnSubmit}
      noValidate
    >
      <p className="text-custom-dark-blue font-regular">
        ¡Para ingresar primero debemos saber datos de ti!
      </p>

      <div className="grid grid-cols-2 items-center justify-center gap-x-4 gap-y-1 w-full">
        <Input
          tittle={"Nombre"}
          type={"text"}
          required={true}
          name={"name"}
          value={formData.name}
          onChange={updateFormData}
          size={"small"}
          onBlur={handleBlur}
          error={errors.name}
        />
        <Input
          tittle={"Apellido"}
          type={"text"}
          required={true}
          name={"lastname"}
          value={formData.lastname}
          onChange={updateFormData}
          size={"small"}
          onBlur={handleBlur}
          error={errors.lastname}
        />
        <Input
          tittle={"DNI"}
          type={"text"}
          required={true}
          name={"dni"}
          value={formData.dni}
          onChange={updateFormData}
          description={"Sin guiones ni espacios"}
          size={"small"}
          onBlur={handleBlur}
          error={errors.dni}
        />
        <Input
          tittle={"Perfil"}
          type={"text"}
          name={"role"}
          value={"Paciente"}
          onChange={updateFormData}
          disable={true}
          tooltip={true}
          tooltipText={
            "El registro en línea es solo para pacientes. Para otros roles, por favor, comunícate con el personal administrativo."
          }
          description={"Por defecto: Paciente"}
          size={"small"}
        />
        <Input
          tittle={"Teléfono"}
          type={"tel"}
          required={true}
          name={"telephone"}
          value={formData.telephone}
          onChange={updateFormData}
          description={"xxx xxx xxxx"}
          size={"small"}
          onBlur={handleBlur}
          error={errors.telephone}
        />
        <Input
          tittle={"Fecha de Nacimiento"}
          type={"date"}
          required={true}
          name={"birthDate"}
          value={formData.birthDate}
          onChange={updateFormData}
          description={"dd/mm/yyyy"}
          size={"small"}
          onBlur={handleBlur}
          error={errors.birthDate}
        />
        <div className="col-start-1 col-span-2 space-y-4">
          <Input
            tittle={"Correo Electrónico"}
            type={"email"}
            required={true}
            name={"email"}
            value={formData.email}
            onChange={updateFormData}
            description={"ejemplo@email.ejemplo"}
            size={"small"}
            onBlur={handleBlur}
            error={errors.email}
          />
          <Input
            tittle={"Confirmar Correo Electrónico"}
            type={"email"}
            required={true}
            name={"confirmEmail"}
            value={formData.confirmEmail}
            onChange={updateFormData}
            description={"ejemplo@email.ejemplo"}
            size={"small"}
            onBlur={handleBlur}
            error={errors.confirmEmail}
          />
        </div>

        <Input
          tittle={"Contraseña"}
          type={inputPassswordType}
          icon={passwordIcon}
          useButton={handleTogglePassword}
          onChange={updateFormData}
          required={true}
          name={"password"}
          value={formData.password}
          size={"small"}
          onBlur={handleBlur}
          error={errors.password}
        />
        <Input
          tittle={"Confirmar Contraseña"}
          type={inputConfirmPassswordType}
          icon={confirmPasswordIcon}
          useButton={handleToggleConfirmPassword}
          onChange={updateFormData}
          required={true}
          name={"confirmPassword"}
          value={formData.confirmPassword}
          size={"small"}
          onBlur={handleBlur}
          error={errors.confirmPassword}
        />
      </div>
      <div className="flex flex-row gap-10 mt-6">
        <Button
          text={"Ingresar"}
          variant="secondary"
          onClick={handleToLogin}
          type="button"
          disable={loading}
        />
        <Button text={"Crear Perfil"} variant="primary" type="submit" isLoading={loading} />
      </div>
    </form>
  );

  return (
    <div className="relative min-h-screen w-full">
      <div className="relative z-20 min-h-screen grid grid-cols-2 items-center justify-items-center p-8 gap-8">
        <div className="flex flex-col items-center justify-center bg-white py-25 px-35 rounded-full">
          <img className="w-120 m-2 p-1" src="/icono.png" alt="Logo" />
          <h1 className="text-4xl font-extrabold text-custom-dark-blue text-center">
            VITALIS CENTRO <br /> MÉDICO
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          <PrincipalCard title="Crear Perfil" content={registerContent} />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
