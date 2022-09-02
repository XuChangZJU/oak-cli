import React from 'react';
import { Button, Row, Col, Form, Input, Space, Textarea } from 'tdesign-react';
import OakGallery from '@oak-general-business/components/extraFile/gallery';
import { Location, Map } from '@oak-general-business/components/amap';
import Style from './web.module.less';


const { FormItem } = Form;

export default function render(this: any) {
    const { t } = this;
    const { coordinate, areaId, name, addrDetail } = this.state;
    return (
        <div className={Style.container}>
            <Row>
                <Col xs={12} sm={6}>
                    <Form colon={true}>
                        <FormItem label={t('store:attr.name')}>
                            <>
                                <Input
                                    onChange={(value) => {
                                        this.setUpdateData('name', value);
                                    }}
                                    value={name}
                                />
                            </>
                        </FormItem>
                        <FormItem label={t('store:attr.coordinate')}>
                            <>
                                <Button
                                    onClick={() => {
                                        this.setState({
                                            visible: true,
                                        });
                                    }}
                                    variant="outline"
                                >
                                    {coordinate ? '重选位置' : '选择位置'}
                                </Button>
                            </>
                        </FormItem>
                        <FormItem style={{ marginLeft: 100 }}>
                            <>
                                <Map
                                    akey="aefab052957668fef114f7e7fd4910fb"
                                    style={{
                                        height: 200,
                                        width: '100%',
                                    }}
                                    mapProps={{
                                        zoom: 13,
                                    }}
                                >
                                    {({ AMap, map, container }) => {
                                        if (map) {
                                            if (coordinate) {
                                                const marker = new AMap.Marker({
                                                    icon: new AMap.Icon({
                                                        imageSize:
                                                            new AMap.Size(
                                                                25,
                                                                34
                                                            ),
                                                        image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
                                                    }),
                                                    position:
                                                        coordinate.coordinate,
                                                    offset: new AMap.Pixel(
                                                        -13,
                                                        -30
                                                    ),
                                                });
                                                marker.setMap(map);
                                                map.setFitView(
                                                    null,
                                                    false,
                                                    [100, 60, 100, 60],
                                                    12
                                                );
                                            }
                                        }
                                        return undefined;
                                    }}
                                </Map>
                            </>
                        </FormItem>
                        <FormItem label={t('store:attr.addrDetail')}>
                            <>
                                <Input
                                    onChange={(value) => {
                                        this.setUpdateData('addrDetail', value);
                                    }}
                                    value={addrDetail}
                                />
                            </>
                        </FormItem>
                        <FormItem label={t('book:attr.files')}>
                            <>
                                <OakGallery
                                    oakPath="extraFile$entity"
                                    oakParent={this.state.oakFullpath}
                                    type="image"
                                    origin="qiniu"
                                    tag1="cover"
                                    entity="book"
                                ></OakGallery>
                            </>
                        </FormItem>

                        <FormItem style={{ marginLeft: 100 }}>
                            <Space>
                                <Button
                                    type="submit"
                                    theme="primary"
                                    onClick={() => {
                                        this.confirm();
                                    }}
                                >
                                    {t('submit')}
                                </Button>
                                <Button
                                    type="reset"
                                    theme="default"
                                    onClick={() => {
                                        this.reset();
                                    }}
                                >
                                    {t('reset')}
                                </Button>
                            </Space>
                        </FormItem>
                    </Form>
                </Col>
            </Row>

            <Location
                visible={this.state.visible}
                akey="aefab052957668fef114f7e7fd4910fb"
                onClose={() => {
                    this.setState({
                        visible: false,
                    });
                }}
                onConfirm={(poi, result) => {
                    this.setState({
                        visible: false,
                    });

                    const areaId = poi.adcode;
                    const lng = poi.location.lng;
                    const lat = poi.location.lat;
                    const address = poi.address;
                    const coordinate = {
                        type: 'point',
                        coordinate: [lng, lat],
                    };

                    this.setUpdateData('coordinate', coordinate);
                    this.setUpdateData('areaId', areaId);
                    this.setUpdateData('addrDetail', address);
                }}
            />
        </div>
    );
}