// /* eslint-disable react/prop-types */
import { Image, Text, View, Page, Document, StyleSheet } from '@react-pdf/renderer';
import { Fragment } from 'react';
// import logo from "./logo.png";
import moment from 'moment';


const SalesOrderPDFTemplate = ({ data }) => {

    const MAX_ROWS_PER_PAGE = 11; // Define the maximum number of rows per page
    // let lastEmpty = false
    const getPages = (items) => {
        const pages = [];
        let i = 0
        while (i < items.length) {
            if (i === 0) {
                pages.push(items.slice(i, i + MAX_ROWS_PER_PAGE));
                i += MAX_ROWS_PER_PAGE
            } else {
                pages.push(items.slice(i, i + (MAX_ROWS_PER_PAGE + 6)));
                i += MAX_ROWS_PER_PAGE + 4
            }
        }
        // console.log(pages)
        if (pages.length === 1 && pages[pages.length - 1].length >= 8) {
            pages.push([])
        } else if (pages[pages.length - 1].length > 13) {
            pages.push([])
        }
        // console.log(pages)
        return pages;
    };

    const pages = getPages(data.order.sales_order_products);

    const styles = StyleSheet.create({
        page: { fontSize: 11, paddingTop: 20, paddingLeft: 40, paddingRight: 40, lineHeight: 1.5, flexDirection: 'column' },

        spaceBetween: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', color: "#000000" },

        titleContainer: { flexDirection: 'row', marginTop: 24 },

        logo: { height: 120, width: 159.9996 },

        reportTitle: {
            fontSize: 25, textAlign: 'center', color: "#2D3B8D", fontWeight: "bold"
        },

        addressTitle: { fontSize: 12, fontWeight: 'bold', textTransform: "capitalize" },

        title: { fontWeight: 'bold', fontSize: 20 },

        ref_num: { fontSize: 12, fontWeight: 'bold', paddingTop: 10 },

        person_res: {
            fontSize: 12, fontWeight: 'bold', paddingTop: 5
        },
        salesinvoicetitle: { fontWeight: "bold", fontSize: 25 },
        address: { fontWeight: 400, fontSize: 10 },

        theader: { marginTop: 20, fontSize: 10, fontWeight: 'bold', paddingTop: 4, paddingLeft: 7, flex: 1, backgroundColor: '#DEDEDE', borderColor: 'f5f5f5', borderRightWidth: 1, borderBottomWidth: 1, borderTop: 1 },

        theader2: { flex: 0.5, borderLeftWidth: 1, borderBottomWidth: 1 },
        theader3: { flex: 2 },

        tbody: { fontSize: 9, paddingTop: 4, height: 40, justifyContent: "center", paddingLeft: 7, flex: 1, borderColor: "f5f5f5", borderRightWidth: 1, borderBottomWidth: 1, },

        total: { fontSize: 9, paddingTop: 4, height: 30, justifyContent: "center", paddingLeft: 7, flex: 1, borderColor: "f5f5f5", borderRightWidth: 0, borderBottomWidth: 1, backgroundColor: '#DEDEDE' },

        total2: { borderLeftWidth: 1, borderRight: "1 #DEDEDE", flex: 2 },

        total3: {
            borderRightWidth: 1,
            fontSize: 12,
            textAlign: "right",
            paddingRight: 10,
            paddingLeft: "-7"
        },
        total4: { borderRightWidth: 1 },
        tbody2: { flex: 2, textOverflow: "none" },
        tbody3: {
            flex: 0.5,
            borderLeftWidth: 1,
        },
        // total5: {
        //     borderTopWidth: 1,
        // },
        pageNumber: {
            position: 'absolute',
            fontSize: 12,
            bottom: 35,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'grey',
        },
        lastPage: {
            fontSize: 12,
            textAlign: 'center',
            color: 'black',
            justifyContent: "space-between",
            marginTop: "auto"
        },
        signature: {
            paddingTop: 20,
        },
        notes: {
            // paddingBottom: 50,
            // height: 75,
        }
    })

    const InvoiceTitle = () => (
        <View style={styles.titleContainer}>
            <View style={styles.spaceBetween}>
                <Image style={styles.logo} src="/public/logo.png"
                />
                <Text style={styles.reportTitle}>Mansoori Truck Parts LTD</Text>
            </View>
        </View>
    );

    const Address = () => (<View style={styles.titleContainer}>
        <View style={styles.spaceBetween}>
            <View>
                <Text style={styles.title}>Sales Order </Text>
                <Text style={styles.ref_num}>Document number: {data.order.reference_number} </Text>
                <Text style={styles.person_res}>Status: {data.order.status}</Text>
            </View>
            <View>
                <Text style={styles.addressTitle}>Date: {formattedDate}</Text>
            </View>
        </View>
    </View>
    );

    const dateString = data.order.order_date;
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const formattedDate = `${day}/${month}/${year}, ${moment(date).format('hh:mm A')}`;

    const TableHead = () => (
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <View style={[styles.theader, styles.theader2]}>
                <Text style={{ color: 'black' }}>S/N</Text>
            </View>
            <View style={[styles.theader, styles.theader3]}>
                <Text style={{ color: 'black' }}>Product</Text>
            </View>
            <View style={styles.theader}>
                <Text style={{ color: 'black' }}>SKU</Text>
            </View><View style={styles.theader}>
                <Text style={{ color: 'black' }}>Category</Text>
            </View>
            <View style={styles.theader}>
                <Text style={{ color: 'black' }}>Quantity</Text>
            </View>
            <View style={styles.theader}>
                <Text style={{ color: 'black' }}>Unit Price</Text>
            </View><View style={styles.theader}>
                <Text style={{ color: 'black' }}>Total</Text>
            </View>
        </View>
    );

    const TableBody = ({ items }) => (
        items.map((item, index) => (
            <Fragment key={item.id}>
                <View style={{ width: '100%', flexDirection: 'row' }} wrap>
                    <View style={[styles.tbody, styles.tbody3]} break>
                        <Text >{index + 1}</Text>
                    </View>
                    <View style={[styles.tbody, styles.tbody2]} break>
                        <Text >{item.stock.product.name}</Text>
                    </View>
                    <View style={styles.tbody} break>
                        <Text>{item.stock.product.sku} </Text>
                    </View><View style={styles.tbody} break>
                        <Text>{item.stock.product.category_obj.name} </Text>
                    </View><View style={styles.tbody} break>
                        <Text>{item.quantity} </Text>
                    </View>
                    <View style={styles.tbody} break>
                        <Text>{item.stock.product.sales_price.toLocaleString()}</Text>
                    </View>
                    <View style={styles.tbody} break>
                        <Text>{(item.quantity * item.stock.product.sales_price).toLocaleString()}</Text>
                    </View>
                </View>
            </Fragment>
        ))
    );

    const TableTotal = () => {
        const grandTotal = data.order.sales_order_products.reduce((sum, item) =>
            sum + (item.quantity * item.stock.product.sales_price), 0
        );

        return (
            <View style={{ width: '100%', flexDirection: 'row' }}>
                <View style={[styles.total, styles.total2]}>
                    <Text></Text>
                </View>
                <View style={styles.total}>
                    <Text></Text>
                </View>
                <View style={styles.total}>
                    <Text></Text>
                </View>
                <View style={styles.total}>
                    <Text></Text>
                </View>
                <View style={styles.total}>
                    <Text></Text>
                </View>
                <View style={[styles.total, { fontWeight: 'bold' }]}>
                    <Text>Total</Text>
                </View>
                <View style={[styles.total, { fontWeight: 'bold', textAlign: 'right' }]}>
                    <Text>{grandTotal.toLocaleString()}</Text>
                </View>
            </View>
        );
    };

    const LastPage = () => (
        <View style={{ display: "flex", flexDirection: "row", marginTop: 5, justifyContent: "space-between" }}>
            <View style={styles.notes}>
                <Text>Notes: {data.notes || ''}</Text>
            </View>
            <View>
                <Text>Checked By:</Text>
                <Text style={styles.signature}>___________________</Text>
                <Text style={{ fontStyle: "italic" }}>Sign Here</Text>
            </View>
        </View>
    )


    return (
        <Document>
            {pages.map((pageItems, pageIndex) => (
                <Page key={pageIndex} size="A4" style={styles.page}>
                    {pageIndex === 0 && <InvoiceTitle />}
                    {pageIndex === 0 && <Address />}
                    {(pageItems.length > 0) && <TableHead />}
                    <TableBody items={pageItems} />
                    {pageIndex === pages.length - 1 && <TableTotal />}
                    {pageIndex === pages.length - 1 && <LastPage />}
                    <Text style={styles.pageNumber}>Page {pageIndex + 1} of {pages.length}</Text>
                </Page>
            ))}

        </Document>
    )
}

export default SalesOrderPDFTemplate;