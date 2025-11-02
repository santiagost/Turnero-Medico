const Select = ({ tittle, options, disable, value, onChange, placeholder, name, required, onBlur, error, description }) => {
    const textColor = (value === "")
        ? "text-gray-400"
        : "text-custom-dark-blue";
        
    const baseContainerStyles = `
        border-2 rounded-lg flex flex-row justify-between pl-4 pr-6
        transition-colors duration-200 ease-in-out py-3
    `;

    const borderStyles = error
        ? 'border-custom-red'
        : 'border-custom-blue';

    const variantStyles = error
        ? ''
        : 'focus-within:border-custom-dark-blue hover:border-custom-dark-blue/70';

    return (
        <div className="flex flex-col gap-1 w-full">
            <p className="text-custom-mid-dark-blue font-medium text-start">{tittle}</p>
            <div className={`${baseContainerStyles} ${borderStyles} ${variantStyles}`}>
                <select
                    className={`${textColor} bg-transparent outline-none w-full`}
                    disabled={disable}
                    value={value}
                    onChange={onChange}
                    name={name}
                    required={required}
                    onBlur={onBlur}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}

                    {options && options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            className="text-custom-dark-blue"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            {error ? (
                <p className="text-xs text-custom-red ml-1 text-left">{error}</p>
            ) : (
                description && <p className="text-xs text-custom-gray ml-1 text-left">{description}</p>
            )}
        </div>
    );
};

export default Select;