import React from 'react';
import {
    Table,
    Tag,
    Button,
    DialogPlugin,
    Space,
    List,
    Image,
    Row,
    Col,
    Input,
} from 'tdesign-react';
import { Icon } from 'tdesign-icons-react';
import Style from './web.module.less';

const { ListItem, ListItemMeta } = List;

export default function render(this: any) {
    const { t } = this;
    const { width } = this.props;
    const { pagination, books = [], oakLoading, searchValue } = this.state;
    const { pageSize, total, currentPage } = pagination || {};

    if (width === 'xs') {
         return (
             <div className={Style.mobileContainer}>
                 <List>
                     {books?.map((book: any) => (
                         <div
                             key={book.id}
                             onClick={() => {
                                 this.goBookDetailById(book.id);
                             }}
                         >
                             <ListItem>
                                 <ListItemMeta
                                     image={
                                         <Image
                                             src={book.coverPicture}
                                             fit="contain"
                                             style={{ width: 60, height: 60 }}
                                         ></Image>
                                     }
                                     title={book.name}
                                     description={book.introduction}
                                 />
                             </ListItem>
                         </div>
                     ))}
                 </List>
                 <Button
                     shape="circle"
                     size="medium"
                     theme="primary"
                     onClick={() => {
                         this.goBookUpsert();
                     }}
                     icon={<Icon name="add" />}
                     style={{
                         position: 'fixed',
                         bottom: 32,
                         right: 16,
                     }}
                 />
             </div>
         );
    }

    return (
        <div className={Style.container}>
            <Row>
                <Col xs={12} sm={8}>
                    <Space>
                        <Button
                            size="medium"
                            theme="primary"
                            onClick={() => {
                                this.goBookUpsert();
                            }}
                        >
                            {t('action.add')}
                        </Button>
                    </Space>
                </Col>
                <Col xs={12} sm={4}>
                    <Input
                        placeholder="请输入书名"
                        value={searchValue}
                        clearable
                        onChange={(value) => {
                            this.searchValueChange(value);
                        }}
                        onClear={() => {
                            this.searchCancel();
                            this.searchConfirm();
                        }}
                        suffix={<Icon name="search" />}
                        onEnter={(value, { e }) => {
                            this.searchConfirm();
                        }}
                    />
                </Col>
            </Row>

            <Table
                loading={oakLoading}
                data={books}
                rowKey="index"
                columns={[
                    {
                        align: 'center',
                        colKey: 'index',
                        title: '序号',
                    },
                    {
                        colKey: 'iState',
                        title: t('book:attr.iState'),
                        cell: ({ row, rowIndex }) => {
                            return (
                                <Tag theme="primary" size="small">
                                    {t(`book:v.iState.${row.iState}`)}
                                </Tag>
                            );
                        },
                    },
                    {
                        colKey: 'number',
                        title: t('book:attr.number'),
                    },
                    {
                        colKey: 'name',
                        title: t('book:attr.name'),
                    },
                    {
                        colKey: 'author',
                        title: t('book:attr.author'),
                    },
                    {
                        colKey: 'price',
                        title: t('book:attr.price'),
                        ellipsis: true,
                    },
                    {
                        colKey: 'introduction',
                        title: t('book:attr.introduction'),
                        ellipsis: true,
                    },

                    {
                        colKey: 'op',
                        width: 300,
                        title: '操作',
                        align: 'center',
                        cell: ({ row, rowIndex }) => {
                            return (
                                <>
                                    <Button
                                        theme="primary"
                                        variant="text"
                                        onClick={() => {
                                            this.goBookDetailById(row.id);
                                        }}
                                    >
                                        详情
                                    </Button>
                                    <Button
                                        theme="primary"
                                        variant="text"
                                        onClick={() => {
                                            this.goBookUpsertById(row.id);
                                        }}
                                    >
                                        编辑
                                    </Button>
                                    <Button
                                        theme="primary"
                                        variant="text"
                                        onClick={() => {
                                            const confirmDia = DialogPlugin!
                                                .confirm!({
                                                header: '确认删除该图书吗？',
                                                body: '删除后，图书不可恢复',
                                                confirmBtn: '确定',
                                                cancelBtn: '取消',
                                                onConfirm: async ({ e }) => {
                                                    this.onRemoveBook(
                                                        `${rowIndex}`
                                                    );
                                                    confirmDia!.hide!();
                                                },
                                                onClose: ({ e, trigger }) => {
                                                    confirmDia!.hide!();
                                                },
                                            });
                                        }}
                                    >
                                        删除
                                    </Button>
                                </>
                            );
                        },
                        fixed: 'right',
                    },
                ]}
                pagination={{
                    total: total,
                    pageSize: pageSize,
                    current: currentPage,
                    onPageSizeChange: (pageSize: number) => {
                        this.setPageSize(pageSize);
                    },
                    onCurrentChange: (current) => {
                        this.setCurrentPage(current);
                    },
                }}
            />
        </div>
    );
}
