import { ordersActions, ordersSelector } from '@slices/orders'
import { useActionCreators, useDispatch, useSelector } from '@store/hooks'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchOrdersWithFilters } from '../../services/slice/orders/thunk'
import { FiltersOrder } from '../../services/slice/orders/type'
import { AppRoute } from '../../utils/constants'
import Filter from '../filter'
import { FilterValue, FilterValues } from '../filter/helpers/types'
import styles from './admin.module.scss'
import { ordersFilterFields } from './helpers/ordersFilterFields'

const getFilterValue = (value: FilterValue) =>
    typeof value === 'object' && value !== null ? value.value : value

export default function AdminFilterOrders() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [_, setSearchParams] = useSearchParams()

    const { updateFilter, clearFilters } = useActionCreators(ordersActions)
    const filterOrderOption = useSelector(ordersSelector.selectFilterOption)

    const handleFilter = (filters: FilterValues) => {
        const normalizedFilters = Object.fromEntries(
            Object.entries(filters).map(([key, value]) => [
                key,
                getFilterValue(value),
            ])
        ) as Partial<FiltersOrder>
        const status = getFilterValue(filters.status)

        normalizedFilters.status =
            typeof status === 'string' ? (status as FiltersOrder['status']) : ''

        dispatch(updateFilter(normalizedFilters))
        const queryParams: { [key: string]: string } = {}
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                queryParams[key] = String(getFilterValue(value))
            }
        })
        setSearchParams(queryParams)
        navigate(
            `${AppRoute.AdminOrders}?${new URLSearchParams(queryParams).toString()}`
        )
    }

    const handleClearFilters = () => {
        dispatch(clearFilters())
        setSearchParams({})
        dispatch(fetchOrdersWithFilters({}))
        navigate(AppRoute.AdminOrders)
    }

    return (
        <>
            <h2 className={styles.admin__title}>Фильтры</h2>
            <Filter
                fields={ordersFilterFields}
                onFilter={handleFilter}
                onClear={handleClearFilters}
                defaultValue={filterOrderOption}
            />
        </>
    )
}
