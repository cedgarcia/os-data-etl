export const mapCategory = (old) => {
  const name = old.id === 18 ? 'Sports Life' : old.name
  const link =
    old.id === 18
      ? 'sports-life'
      : old.name
      ? old.name.toLowerCase().replace(/\s+/g, '')
      : ''
  return {
    name: name,
    redirectUrl: 'Internal',
    link: link,
    refs: [
      {
        model: 'addedBy',
        // id: '68ecba72ffef4e0002407de1#0003',
        id: '68dba1c6f258460002afd595#0005',
        modelId: 'users',
      },
      {
        model: 'updatedBy',
        // id: '68ecba72ffef4e0002407de1#0003',
        id: '68dba1c6f258460002afd595#0005',
        modelId: 'users',
      },
    ],
  }
}
