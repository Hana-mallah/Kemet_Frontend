import { api } from '../baseApi'

export interface Category {
    id: string
    title: string
}

export const categoriesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query<Category[], void>({
            query: () => '/Category',
            providesTags: ['Category'],
        }),
        createCategory: builder.mutation<Category, Pick<Category, 'title'>>({
            query: (categoryData) => ({
                url: '/Category',
                method: 'POST',
                body: categoryData,
            }),
            invalidatesTags: ['Category'],
        }),
        deleteCategory: builder.mutation<void, string>({
            query: (id) => ({
                url: `/Category/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Category'],
        }),
        updateCategory: builder.mutation<Category, { id: string; title: string }>({
            query: ({ id, title }) => ({
                url: `/Category/${id}`,
                method: 'PUT',
                body: { title },
            }),
            invalidatesTags: ['Category'],
        }),
    }),
})

export const {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useDeleteCategoryMutation,
    useUpdateCategoryMutation,
} = categoriesApi
