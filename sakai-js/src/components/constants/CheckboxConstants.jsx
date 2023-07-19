export const defaultAuthorities = [
    {name : "CREATE", key : 'CREATE', selected: false},
    {name : "READ", key : 'READ', selected: false},
    {name : "UPDATE", key : 'UPDATE', selected: false},
    {name : "DELETE", key : 'DELETE', selected: false},
  ] 
 const readAndEditDefaultAuthorities = [ {name : "READ", key : 'READ', selected: false}, 
                                      {name : "UPDATE", key : 'UPDATE', selected: false}]
 const crdDefaultAuthorities = [
  {name : "CREATE", key : 'CREATE', selected: false},
  {name : "READ", key : 'READ', selected: false},
  {name : "DELETE", key : 'DELETE', selected: false},
 ]
  export const defaultTables = [
    { name: 'Suppliers', key: 'SUPPLIERS', authorities : [...defaultAuthorities] },
    { name: 'Customers', key: 'CUSTOMERS', authorities : [...defaultAuthorities] },
    { name: 'Contact Persons', key: 'CONTACTPERSONS', authorities :  [...readAndEditDefaultAuthorities]},
    { name: 'Products', key: 'PRODUCTS', authorities : [...defaultAuthorities]},
    { name: 'Brands', key: 'BRANDS', authorities : [...crdDefaultAuthorities]}

];

export const forNewAuthorities = [
  {name : "CREATE", key : 'CREATE', selected: false},
  {name : "READ", key : 'READ', selected: true},
  {name : "UPDATE", key : 'UPDATE', selected: false},
  {name : "DELETE", key : 'DELETE', selected: false},
] 
const readAndEditForNewAuthorities = [ {name : "READ", key : 'READ', selected: true}, 
                                      {name : "UPDATE", key : 'UPDATE', selected: false}, ]

const  crdForNewAuthorities = [
  {name : "CREATE", key : 'CREATE', selected: false},
  {name : "READ", key : 'READ', selected: true},
  {name : "DELETE", key : 'DELETE', selected: false},
]

export const forNewTables = [
  { name: 'Suppliers', key: 'SUPPLIERS', authorities : [...forNewAuthorities] },
  { name: 'Customers', key: 'CUSTOMERS', authorities : [...forNewAuthorities] },
  { name: 'Contact Persons', key: 'CONTACTPERSONS', authorities :  [...readAndEditForNewAuthorities]},
  { name: 'Products', key: 'PRODUCTS', authorities : [...forNewAuthorities]},
  { name: 'Brands', key: 'BRANDS', authorities : [...crdForNewAuthorities]}
];