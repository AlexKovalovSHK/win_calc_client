// components/PdfDocument.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// 1. Регистрируем шрифт с поддержкой кириллицы (берем с CDN для примера)
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf'
});

// 2. Стили (похожи на CSS, но это JS-объекты)
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto', // Используем наш шрифт
    fontSize: 12,
  },
  header: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  // Таблица
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 20,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row"
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 5,
    fontSize: 10
  },
  // Итоги
  totals: {
    marginTop: 20,
    textAlign: 'right',
    fontSize: 14,
  }
});

// Тип данных (должен совпадать с SimpleCalculator)
interface CartItem {
  width: number;
  height: number;
  quantity: number;
  profileName: string;
  glazingName: string;
  pricePerUnit: number;
  totalPrice: number;
}

interface PdfProps {
  items: CartItem[];
  grandTotal: number;
}

// 3. Сам компонент документа
export const InvoiceDocument = ({ items, grandTotal }: PdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Коммерческое предложение</Text>
      
      <View style={styles.section}>
        <Text>Дата: {new Date().toLocaleDateString()}</Text>
        <Text>Проект: Расчет стоимости остекления</Text>
      </View>

      {/* Таблица */}
      <View style={styles.table}>
        {/* Заголовок таблицы */}
        <View style={styles.tableRow}>
          <View style={{ ...styles.tableCol, width: '25%' }}>
            <Text style={styles.tableCell}>Размер (мм)</Text>
          </View>
          <View style={{ ...styles.tableCol, width: '35%' }}>
            <Text style={styles.tableCell}>Конфигурация</Text>
          </View>
          <View style={{ ...styles.tableCol, width: '10%' }}>
            <Text style={styles.tableCell}>Кол-во</Text>
          </View>
          <View style={{ ...styles.tableCol, width: '15%' }}>
            <Text style={styles.tableCell}>Цена ед.</Text>
          </View>
          <View style={{ ...styles.tableCol, width: '15%' }}>
            <Text style={styles.tableCell}>Сумма</Text>
          </View>
        </View>

        {/* Строки данных */}
        {items.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={{ ...styles.tableCol, width: '25%' }}>
              <Text style={styles.tableCell}>{item.width} x {item.height}</Text>
            </View>
            <View style={{ ...styles.tableCol, width: '35%' }}>
              <Text style={styles.tableCell}>{item.profileName}</Text>
              <Text style={{ ...styles.tableCell, fontSize: 8, color: 'grey' }}>{item.glazingName}</Text>
            </View>
            <View style={{ ...styles.tableCol, width: '10%' }}>
              <Text style={styles.tableCell}>{item.quantity}</Text>
            </View>
            <View style={{ ...styles.tableCol, width: '15%' }}>
              <Text style={styles.tableCell}>{item.pricePerUnit} €</Text>
            </View>
            <View style={{ ...styles.tableCol, width: '15%' }}>
              <Text style={styles.tableCell}>{item.totalPrice} €</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Итого */}
      <View style={styles.totals}>
        <Text>Итого к оплате: {grandTotal} €</Text>
      </View>
      
      <View style={{ position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', fontSize: 10, color: 'grey' }}>
        <Text>Создано в WinCalc</Text>
      </View>
    </Page>
  </Document>
);