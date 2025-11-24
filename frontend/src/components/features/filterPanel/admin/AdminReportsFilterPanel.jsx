import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch } from "react-icons/fa";
import { LiaUndoAltSolid } from "react-icons/lia";

import Input from '../../../ui/Input';
import Button from '../../../ui/Button';
import IconButton from '../../../ui/IconButton';
import Select from '../../../ui/Select';

import { commonRules } from '../../../../validations/commonRules';

const getDateRange = (rangeType) => {
    const today = new Date();
    let to = new Date();
    let from = new Date();

    switch (rangeType) {
        case 'today':
            break;
        case 'week':
            from.setDate(today.getDate() - 7);
            break;
        case 'month':
            from = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        case 'lastMonth':
            from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            to = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        case 'year':
            from = new Date(today.getFullYear(), 0, 1);
            break;
        default:
            return { from: "", to: "" };
    }
    const formatDate = (d) => d.toISOString().split('T')[0];
    return { from: formatDate(from), to: formatDate(to) };
};

const defaultMonthRange = getDateRange('month');

const initialFiltersState = {
    fromDate: defaultMonthRange.from,
    toDate: defaultMonthRange.to
};

const AdminReportsFilterPanel = ({ setFiltersData }) => {
    const [localFilters, setLocalFilters] = useState(initialFiltersState);
    const [selectedRange, setSelectedRange] = useState("month");
    const [errors, setErrors] = useState({});

    const dateRangeOptions = [
        { value: "custom", label: "Personalizado" },
        { value: "today", label: "Hoy" },
        { value: "week", label: "Últimos 7 días" },
        { value: "month", label: "Este mes" },
        { value: "lastMonth", label: "Mes pasado" },
        { value: "year", label: "Este año" }
    ]

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
        setSelectedRange("custom");

        if (errors[name] || errors.toDate) {
            setErrors(prev => ({ ...prev, [name]: null, toDate: null }));
        }
    };

    const handleRangeChange = (e) => {
        const range = e.target.value;
        setSelectedRange(range);
        if (range !== 'custom') {
            const { from, to } = getDateRange(range);
            setLocalFilters({ fromDate: from, toDate: to });
            setErrors({});
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        if (name === 'toDate') {
            const error = commonRules.dateRange(localFilters.fromDate)(value);
            setErrors(prev => ({ ...prev, toDate: error }));
        }
        if (name === 'fromDate' && localFilters.toDate) {
            const error = commonRules.dateRange(value)(localFilters.toDate);
            setErrors(prev => ({ ...prev, toDate: error }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const rangeError = commonRules.dateRange(localFilters.fromDate)(localFilters.toDate);

        if (rangeError) {
            newErrors.toDate = rangeError;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSearchClick = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setFiltersData(localFilters);
    };

    const handleResetClick = () => {
        setLocalFilters(initialFiltersState);
        setFiltersData(initialFiltersState);
        setSelectedRange("month");
        setErrors({});
    };

    useEffect(() => {
        setFiltersData(initialFiltersState);
    }, []);

    return (
        <div className="w-full p-4">
            <form
                className="grid grid-cols-4 items-start gap-4 w-full"
                onSubmit={handleSearchClick}
            >

                <Select
                    tittle={"Periodo"}
                    name={"dateRange"}
                    options={dateRangeOptions}
                    value={selectedRange}
                    onChange={handleRangeChange}
                    size='small'
                />

                <Input
                    tittle="Desde"
                    name="fromDate"
                    type="date"
                    value={localFilters.fromDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.fromDate}
                    size="small"
                />
                <Input
                    tittle="Hasta"
                    name="toDate"
                    type="date"
                    value={localFilters.toDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.toDate}
                    size="small"
                />

                <div className='flex flex-row items-center justify-end h-full gap-3 pt-4 lg:pt-0'>
                    <Button
                        text={"Filtrar"}
                        icon={<FaSearch />}
                        variant={"primary"}
                        type={"submit"}
                        size={"medium"}
                    />
                    <motion.div whileTap={{ scale: 0.9, rotate: -180 }}>
                        <IconButton
                            icon={<LiaUndoAltSolid size={30} />}
                            type={"button"}
                            onClick={handleResetClick}
                        />
                    </motion.div>
                </div>
            </form>
        </div>
    );
};

export default AdminReportsFilterPanel;