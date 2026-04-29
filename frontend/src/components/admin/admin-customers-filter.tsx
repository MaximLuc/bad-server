import { useActionCreators, useDispatch, useSelector } from '@store/hooks'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    customersActions,
    customersSelector,
} from '../../services/slice/customers'
import { fetchCustomersWithFilters } from '../../services/slice/customers/thunk'
import { FiltersCustomers } from '../../services/slice/customers/type'
import { AppRoute } from '../../utils/constants'
import Filter from '../filter'
import { FilterValue, FilterValues } from '../filter/helpers/types'
import styles from './admin.module.scss'
import { customersFilterFields } from './helpers/customersFilterFields'

const getFilterValue = (value: FilterValue) =>
    typeof value === 'object' && value !== null ? value.value : value

export default function AdminFilterCustomers() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [_, setSearchParams] = useSearchParams()
    const { updateFilter, clearFilters } = useActionCreators(customersActions)
    const filterCustomersOption = useSelector(
        customersSelector.selectFilterOption
    )
    const handleFilter = (filters: FilterValues) => {
        const normalizedFilters = Object.fromEntries(
            Object.entries(filters).map(([key, value]) => [
                key,
                getFilterValue(value),
            ])
        ) as Partial<FiltersCustomers>

        dispatch(updateFilter(normalizedFilters))
        const queryParams: { [key: string]: string } = {}
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                queryParams[key] = String(getFilterValue(value))
            }
        })
        setSearchParams(queryParams)
        navigate(
            `${AppRoute.AdminCustomers}?${new URLSearchParams(
                queryParams
            ).toString()}`
        )
    }

    const handleClearFilters = () => {
        dispatch(clearFilters())
        setSearchParams({})
        dispatch(fetchCustomersWithFilters({}))
        navigate(AppRoute.AdminCustomers)
    }

    return (
        <>
            <h2 className={styles.admin__title}>Фильтры</h2>
            <Filter
                fields={customersFilterFields}
                onFilter={handleFilter}
                defaultValue={filterCustomersOption}
                onClear={handleClearFilters}
            />
        </>
    )
}
