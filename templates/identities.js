;[
    {
        type: UserType.Person,
        fields: [
            {
                id: 'username',
                name: 'username',
                required: true,
                type: FieldType.Text,
            },
            {
                id: 'name',
                name: 'name',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'firstName',
                name: 'First name',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'lastName',
                name: 'Last name',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'description',
                name: 'Description',
                type: FieldType.Text,
            },
            {
                id: 'image',
                name: 'Image',
                type: FieldType.Text,
            },
            {
                id: 'address',
                name: 'Address',
                type: FieldType.Text,
            },
            {
                id: 'jobTitle',
                name: 'Job title',
                type: FieldType.Text,
            },
            {
                id: 'email',
                name: 'Email',
                type: FieldType.Email,
            },
            {
                id: 'bithdate',
                name: 'Birth date',
                type: FieldType.Date,
            },
        ],
    },
    {
        type: UserType.Organization,
        fields: [
            {
                id: 'username',
                name: 'username',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'name',
                name: 'Name',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'description',
                name: 'Description',
                type: FieldType.Text,
            },
            {
                id: 'url',
                name: 'Url',
                type: FieldType.Text,
            },
            {
                id: 'image',
                name: 'Image',
                type: FieldType.Text,
            },
            {
                id: 'address',
                name: 'Address',
                type: FieldType.Text,
            },
            {
                id: 'brand',
                name: 'Brand',
                type: FieldType.Text,
            },
            {
                id: 'email',
                name: 'Email',
                type: FieldType.Email,
            },
        ],
    },
    {
        type: UserType.Service,
        fields: [
            {
                id: 'username',
                name: 'username',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'name',
                name: 'Name',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'description',
                name: 'Description',
                type: FieldType.Text,
            },
            {
                id: 'url',
                name: 'Url',
                type: FieldType.Text,
            },
            {
                id: 'category',
                name: 'Category',
                type: FieldType.Text,
            },
            {
                id: 'brand',
                name: 'Brand',
                type: FieldType.Text,
            },
        ],
    },
    {
        type: UserType.Device,
        fields: [
            {
                id: 'username',
                name: 'username',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'name',
                name: 'name',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'description',
                name: 'Description',
                type: FieldType.Text,
            },
            {
                id: 'url',
                name: 'Url',
                type: FieldType.Text,
            },
            {
                id: 'category',
                name: 'Category',
                type: FieldType.MultipleSelector,
                options: Object.keys(ProductEnum).map((key) => ({ label: key, value: key })),
            },
            {
                id: 'controlledProperty',
                name: 'Controlled property',
                type: FieldType.MultipleSelector,
                options: Object.keys(DeviceControlledProperty).map((key) => ({ label: key, value: key })),
            },
        ],
    },
    {
        type: UserType.Product,
        fields: [
            {
                id: 'username',
                name: 'username',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'name',
                name: 'name',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'description',
                name: 'Description',
                type: FieldType.Text,
            },
            {
                id: 'url',
                name: 'Url',
                type: FieldType.Text,
            },
            {
                id: 'image',
                name: 'Image',
                type: FieldType.Text,
            },
            {
                id: 'address',
                name: 'Address',
                type: FieldType.Text,
            },
            {
                id: 'brand',
                name: 'Brand',
                type: FieldType.Text,
            },
            {
                id: 'manufacturer',
                name: 'Manufacturer',
                type: FieldType.Text,
            },
            {
                id: 'category',
                name: 'Category',
                type: FieldType.TextArray,
            },
            {
                id: 'productId',
                name: 'Product Id',
                type: FieldType.Text,
            },
            {
                id: 'productionDate',
                name: 'Production date',
                type: FieldType.Text,
            },
            {
                id: 'material',
                name: 'Material',
                type: FieldType.Text,
            },
        ],
    },
    {
        type: UserType.Unknown,
        fields: [
            {
                id: 'username',
                name: 'username',
                type: FieldType.Text,
                required: true,
            },
            {
                id: 'name',
                name: 'name',
                type: FieldType.Text,
                required: true,
            },
        ],
    },
]
