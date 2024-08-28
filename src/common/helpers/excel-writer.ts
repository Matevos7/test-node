import * as ExcelJS from "exceljs";
import { upperFirst } from "lodash";

export class ExcelWriter {
  static async toBase64(data: Record<string, string>[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    if (!data || !data.length) {
      return (await workbook.xlsx.writeBuffer()) as Buffer;
    }

    const headers = Object.keys(data[0]).map((e) => e);

    worksheet.columns = headers.map((header) => ({
      header: upperFirst(header),
      key: header,
      width: header.length + 5,
      style: {
        alignment: { vertical: "middle", horizontal: "center" },
        font: {
          size: 14,
          bold: true,
          color: {
            argb: "FF00FF00",
          },
        },
      },
    }));

    data.forEach((item) => {
      worksheet.addRow(item).eachCell((cell) => {
        cell.font = {
          size: 12,
          bold: false,
          color: {
            argb: "000000",
          },
        };
      });
    });

    const buffer: ExcelJS.Buffer = await workbook.xlsx.writeBuffer();

    return buffer as Buffer;
  }
}
