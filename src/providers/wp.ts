export async function wp(formId: string, data: Object) {
  const url = `${process.env.NEXT_PUBLIC_ADMIN_URL}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`;
  const dataMap = new Map(Object.entries(data));

  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (dataMap.get(key) instanceof FileList) {
      Array.from(dataMap.get(key)).forEach((file: any) => {
        formData.append(`${key}[]`, file);
      });
      return;
    }

    formData.append(key, dataMap.get(key));
  });

  formData.append("_wpcf7_unit_tag", `wpcf7-f${formId}-o1`);

  return await fetch(url, {
    method: "POST",
    body: formData,
  });
}
