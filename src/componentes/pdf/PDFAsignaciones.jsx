/** @jsxImportSource react */
import React, { useState, useEffect } from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font,
  PDFViewer,
  PDFDownloadLink,
  Image,
} from '@react-pdf/renderer';
import { Base_url } from '../../Api/Config/apiConfig';

// Registrar fuentes con URLs correctas
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf' },
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf', fontWeight: 'bold' },
  ]
});

// Estilos
const styles = StyleSheet.create({
  page: {
    padding: 25,
    paddingBottom: 50,
    fontFamily: 'Roboto',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 12,
    borderBottom: 2,
    borderBottomColor: '#1a1a2e',
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a1a2e',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: '#4a4a4a',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    fontSize: 7.5,
    color: '#666',
  },
  table: {
    marginTop: 8,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: 3,
  },
  tableHeaderCell: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    paddingVertical: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 2,
    paddingHorizontal: 2,
    minHeight: 16,
  },
  tableRowEven: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    fontSize: 6,
    color: '#333',
    textAlign: 'center',
    paddingVertical: 1,
    paddingHorizontal: 1,
  },
  estadoBadge: {
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 6,
    alignSelf: 'center',
  },
  estadoText: {
    fontSize: 5,
    fontWeight: 'bold',
  },
  imagenContainer: {
    marginTop: 8,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#fafafa',
  },
  imagenTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 6,
    textAlign: 'center',
  },
  imagenMediana: {
    width: 220,
    height: 160,
    objectFit: 'contain',
    borderRadius: 4,
  },
  imagenPlaceholder: {
    width: 220,
    height: 160,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagenPlaceholderText: {
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
  },
  leyendaContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f4f8',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#1a1a2e',
  },
  leyendaTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 3,
  },
  leyendaItem: {
    fontSize: 5.5,
    color: '#444',
    marginBottom: 1.5,
    paddingLeft: 5,
  },
  // ============================================
  // ESTILOS PARA FIRMAS (3 FIRMAS)
  // ============================================
  firmasContainer: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  firmaBox: {
    alignItems: 'center',
    flex: 1,
  },
  firmaLine: {
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 2,
    marginTop: 20,
  },
  firmaLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  firmaSubtext: {
    fontSize: 5.5,
    color: '#888',
    marginTop: 1,
  },
  firmaFecha: {
    fontSize: 6,
    color: '#555',
    marginTop: 2,
  },
  firmaNombre: {
    fontSize: 6.5,
    color: '#444',
    marginTop: 4,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 25,
    right: 25,
    textAlign: 'center',
    fontSize: 5.5,
    color: '#aaa',
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
    paddingTop: 6,
  },
  grupoHeader: {
    flexDirection: 'row',
    backgroundColor: '#e8edf5',
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginTop: 2,
    marginBottom: 1,
    borderRadius: 3,
  },
  grupoHeaderText: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
});

const API_URL = Base_url.replace('/api', '');

// ============================================
// FUNCIÓN PARA CONVERTIR IMAGEN A BASE64
// ============================================
const convertirImagenABase64 = async (url) => {
  try {
    console.log('📷 Intentando cargar imagen desde:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'image/webp,image/png,image/jpeg,image/*',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('❌ Error al convertir imagen:', error);
    return null;
  }
};

// ============================================
// FUNCIÓN PARA AGRUPAR POR RESPONSABLE
// ============================================
const agruparPorResponsable = (asignaciones) => {
  const grupos = {};
  
  asignaciones.forEach(asignacion => {
    const responsable = asignacion.responsable || 'Sin responsable';
    if (!grupos[responsable]) {
      grupos[responsable] = [];
    }
    grupos[responsable].push(asignacion);
  });
  
  return grupos;
};

// ============================================
// COMPONENTE PDFDocument
// ============================================
const PDFDocument = ({ 
  asignaciones, 
  responsable, 
  imagenBase64,
  fechaFirma = null,
}) => {
  // Agrupar asignaciones por responsable
  const gruposAgrupados = agruparPorResponsable(asignaciones);
  const responsables = Object.keys(gruposAgrupados);
  
  // Fecha para las firmas
  const fechaFirmaFormateada = fechaFirma || formatDateFooter();
  
  // ============================================
  // FUNCIONES PARA OBTENER DATOS CON LOS NOMBRES CORRECTOS
  // ============================================
  const obtenerMarca = (asignacion) => {
    return asignacion.equipo_marca || asignacion.marca || '';
  };

  const obtenerModelo = (asignacion) => {
    return asignacion.equipo_modelo || asignacion.modelo || '';
  };

  const obtenerAccesorio = (asignacion) => {
    return asignacion.tipo_accesorio || '';
  };

  const obtenerReferencia = (asignacion) => {
    return asignacion.referencia_accesorio || '';
  };

  // ============================================
  // DETECTAR QUÉ COLUMNAS TIENEN DATOS
  // ============================================
  const columnasConDatos = {
    marca: false,
    modelo: false,
    accesorio: false,
    referencia: false,
  };

  asignaciones.forEach(asig => {
    const marca = obtenerMarca(asig);
    if (marca && marca.trim() !== '') {
      columnasConDatos.marca = true;
    }
    
    const modelo = obtenerModelo(asig);
    if (modelo && modelo.trim() !== '') {
      columnasConDatos.modelo = true;
    }
    
    const accesorio = obtenerAccesorio(asig);
    if (accesorio && accesorio.trim() !== '') {
      columnasConDatos.accesorio = true;
    }
    
    const referencia = obtenerReferencia(asig);
    if (referencia && referencia.trim() !== '') {
      columnasConDatos.referencia = true;
    }
  });

  console.log('📊 Columnas con datos:', columnasConDatos);

  // ============================================
  // DEFINIR COLUMNAS DINÁMICAS
  // ============================================
  const getColumnas = () => {
    const columnas = [
      { key: 'num', label: 'N°', width: '4%' },
      { key: 'responsable', label: 'Responsable', width: '12%' },
      { key: 'equipo', label: 'Equipo', width: '12%' },
    ];
    
    if (columnasConDatos.marca) {
      columnas.push({ key: 'marca', label: 'Marca', width: '10%' });
    }
    
    if (columnasConDatos.modelo) {
      columnas.push({ key: 'modelo', label: 'Modelo', width: '10%' });
    }
    
    if (columnasConDatos.accesorio) {
      columnas.push({ key: 'accesorio', label: 'Accesorio', width: '12%' });
    }
    
    if (columnasConDatos.referencia) {
      columnas.push({ key: 'referencia', label: 'Referencia', width: '12%' });
    }
    
    columnas.push(
      { key: 'estado', label: 'Estado', width: '10%' },
      { key: 'fecha', label: 'Fecha Asig.', width: '15%' }
    );
    
    const totalWidth = columnas.reduce((sum, col) => sum + parseFloat(col.width), 0);
    const remainingWidth = 100 - totalWidth;
    if (remainingWidth > 0) {
      const equipoCol = columnas.find(c => c.key === 'equipo');
      const respCol = columnas.find(c => c.key === 'responsable');
      if (equipoCol) equipoCol.width = `${parseFloat(equipoCol.width) + remainingWidth/2}%`;
      if (respCol) respCol.width = `${parseFloat(respCol.width) + remainingWidth/2}%`;
    }
    
    return columnas;
  };

  const columnas = getColumnas();

  const getEstadoColor = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'ASIGNADO': return { bg: '#e3f2fd', color: '#0d47a1' };
      case 'DEVUELTO': return { bg: '#e8f5e9', color: '#1b5e20' };
      case 'MANTENIMIENTO': return { bg: '#fff3e0', color: '#e65100' };
      default: return { bg: '#f5f5f5', color: '#616161' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) {
        return '-';
      }
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return '-';
    }
  };

  const formatDateFooter = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateHeader = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`
    };
  };

  const currentDate = formatDateHeader();

  // ============================================
  // COMPONENTE PARA MOSTRAR IMAGEN
  // ============================================
  const ImagenMediana = () => {
    if (!imagenBase64) {
      return (
        <View style={styles.imagenPlaceholder}>
          <Text style={styles.imagenPlaceholderText}>Sin imagen disponible</Text>
        </View>
      );
    }

    return (
      <Image
        src={imagenBase64}
        style={styles.imagenMediana}
      />
    );
  };

  // ============================================
  // RENDERIZAR FILAS AGRUPADAS
  // ============================================
  const renderFilasAgrupadas = () => {
    let filas = [];
    let indexGlobal = 0;
    
    responsables.forEach((responsableActual, grupoIndex) => {
      const asignacionesDelGrupo = gruposAgrupados[responsableActual];
      const cantidadEquipos = asignacionesDelGrupo.length;
      
      filas.push(
        <View key={`grupo-header-${responsableActual}`} style={styles.grupoHeader}>
          <Text style={[styles.grupoHeaderText, { flex: 1 }]}>
            {responsableActual}
          </Text>
          <Text style={[styles.grupoHeaderText, { fontSize: 5.5, color: '#666' }]}>
            {cantidadEquipos} equipo{cantidadEquipos > 1 ? 's' : ''}
          </Text>
        </View>
      );
      
      asignacionesDelGrupo.forEach((asignacion, idx) => {
        const estadoColors = getEstadoColor(asignacion.estado);
        const isEven = (indexGlobal % 2 === 0);
        
        const marca = obtenerMarca(asignacion);
        const modelo = obtenerModelo(asignacion);
        const accesorio = obtenerAccesorio(asignacion);
        const referencia = obtenerReferencia(asignacion);
        
        filas.push(
          <View 
            key={`${responsableActual}-${idx}`}
            style={[
              styles.tableRow,
              isEven && styles.tableRowEven
            ]}
          >
            {columnas.map((col) => {
              let valor = '';
              let esEstado = false;
              let bgColor = '';
              let textColor = '#333';
              
              switch(col.key) {
                case 'num':
                  valor = String(indexGlobal + 1);
                  break;
                case 'responsable':
                  valor = idx === 0 ? responsableActual : '';
                  break;
                case 'equipo':
                  valor = asignacion.equipo || '-';
                  break;
                case 'marca':
                  valor = marca || '-';
                  break;
                case 'modelo':
                  valor = modelo || '-';
                  break;
                case 'accesorio':
                  valor = accesorio || '-';
                  break;
                case 'referencia':
                  valor = referencia || '-';
                  break;
                case 'estado':
                  valor = asignacion.estado || 'ASIGNADO';
                  esEstado = true;
                  bgColor = estadoColors.bg;
                  textColor = estadoColors.color;
                  break;
                case 'fecha':
                  valor = formatDate(asignacion.fecha_asignacion);
                  break;
                default:
                  valor = '-';
              }
              
              if (esEstado) {
                return (
                  <Text key={col.key} style={[styles.tableCell, { width: col.width }]}>
                    <View style={[styles.estadoBadge, { backgroundColor: bgColor }]}>
                      <Text style={[styles.estadoText, { color: textColor }]}>
                        {valor}
                      </Text>
                    </View>
                  </Text>
                );
              }
              
              return (
                <Text key={col.key} style={[styles.tableCell, { width: col.width }]}>
                  {valor}
                </Text>
              );
            })}
          </View>
        );
        
        indexGlobal++;
      });
      
      if (grupoIndex < responsables.length - 1) {
        filas.push(
          <View key={`separator-${grupoIndex}`} style={{ height: 1, backgroundColor: '#ccc', marginVertical: 1 }} />
        );
      }
    });
    
    return filas;
  };

  const totalEquipos = asignaciones.length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Control de Asignación de Equipos</Text>
          <Text style={styles.subtitle}>
            {responsable ? `Responsable: ${responsable}` : 'Reporte General de Asignaciones'}
          </Text>
          <View style={styles.infoRow}>
            <Text>Fecha: {currentDate.date}</Text>
            <Text>Hora: {currentDate.time}</Text>
            <Text>Total Equipos: {totalEquipos}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text>Responsables: {responsables.length}</Text>
            <Text>
              {responsables.map(r => `${r}: ${gruposAgrupados[r].length}`).join(' | ')}
            </Text>
          </View>
        </View>

        {/* TABLA */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            {columnas.map((col) => (
              <Text 
                key={col.key} 
                style={[styles.tableHeaderCell, { width: col.width }]}
              >
                {col.label}
              </Text>
            ))}
          </View>

          {asignaciones.length === 0 ? (
            <View style={[styles.tableRow, { padding: 10 }]}>
              <Text style={[styles.tableCell, { width: '100%', textAlign: 'center' }]}>
                No hay asignaciones para mostrar
              </Text>
            </View>
          ) : (
            renderFilasAgrupadas()
          )}
        </View>

        {/* IMAGEN */}
        <View style={styles.imagenContainer}>
          <Text style={styles.imagenTitle}>Evidencia Fotográfica</Text>
          <ImagenMediana />
        </View>

        {/* Leyenda */}
        <View style={styles.leyendaContainer}>
          <Text style={styles.leyendaTitle}>Compromiso de Buen Uso de Equipos</Text>
          <Text style={styles.leyendaItem}>
            • 1. El responsable se compromete a utilizar los equipos asignados exclusivamente para fines laborales autorizados.
          </Text>
          <Text style={styles.leyendaItem}>
            • 2. Deberá mantener los equipos en óptimas condiciones de funcionamiento, reportando cualquier novedad o daño de inmediato.
          </Text>
          <Text style={styles.leyendaItem}>
            • 3. Los equipos no podrán ser prestados, transferidos o utilizados por terceros sin autorización previa.
          </Text>
          <Text style={styles.leyendaItem}>
            • 4. El responsable será solidariamente responsable por el cuidado y conservación de los equipos asignados.
          </Text>
          <Text style={styles.leyendaItem}>
            • 5. Al finalizar la relación laboral o al ser requerido, deberá devolver los equipos en las mismas condiciones en que fueron recibidos.
          </Text>
          <Text style={styles.leyendaItem}>
            • 6. Cualquier pérdida, daño o hurto deberá ser reportado inmediatamente al área correspondiente.
          </Text>
        </View>

        {/* ============================================ */}
        {/* SECCIÓN DE FIRMAS - 3 FIRMAS */}
        {/* ============================================ */}
        <View style={styles.firmasContainer}>
          {/* FIRMA DE QUIEN ENTREGA - SIN NOMBRE */}
          <View style={styles.firmaBox}>
            <View style={styles.firmaLine} />
            <Text style={styles.firmaLabel}>FIRMA DE QUIEN ENTREGA</Text>
            <Text style={styles.firmaSubtext}>Nombre completo</Text>
            <Text style={styles.firmaFecha}>Fecha: {fechaFirmaFormateada}</Text>
          </View>

          {/* FIRMA DEL RESPONSABLE - CON NOMBRE */}
          <View style={styles.firmaBox}>
            <View style={styles.firmaLine} />
            <Text style={styles.firmaLabel}>FIRMA DEL RESPONSABLE</Text>
            <Text style={styles.firmaNombre}>{responsable || '________________________'}</Text>
            <Text style={styles.firmaSubtext}>Nombre completo</Text>
            <Text style={styles.firmaFecha}>Fecha: {fechaFirmaFormateada}</Text>
          </View>

          {/* FIRMA DEL LÍDER DE ÁREA - SIN NOMBRE */}
          <View style={styles.firmaBox}>
            <View style={styles.firmaLine} />
            <Text style={styles.firmaLabel}>FIRMA LÍDER DE ÁREA</Text>
            <Text style={styles.firmaSubtext}>Nombre completo</Text>
            <Text style={styles.firmaFecha}>Fecha: {fechaFirmaFormateada}</Text>
          </View>
        </View>

        {/* Nota adicional debajo de firmas */}
        <View style={{ marginTop: 10, alignItems: 'center' }}>
          <Text style={{ fontSize: 5.5, color: '#999' }}>
            Las firmas validan la entrega, recepción y supervisión de los equipos asignados
          </Text>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          Este documento es un registro de control interno. Su firma valida la recepción y compromiso de buen uso.
          Generado el {formatDateFooter()}
        </Text>
      </Page>
    </Document>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const PDFAsignaciones = ({ 
  asignaciones, 
  responsable, 
  onClose,
  imagenBase64: imagenBase64Prop,
  fechaFirma = null,
}) => {
  const [imagenBase64, setImagenBase64] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorImagen, setErrorImagen] = useState(false);

  useEffect(() => {
    const cargarImagen = async () => {
      // Si ya viene la imagen como prop, usarla
      if (imagenBase64Prop) {
        setImagenBase64(imagenBase64Prop);
        setCargando(false);
        return;
      }

      const asignacionConImagen = asignaciones.find(a => a.imagen_url);
      const imagenUrl = asignacionConImagen?.imagen_url;
      
      if (imagenUrl) {
        try {
          const urlCompleta = imagenUrl.startsWith('http') 
            ? imagenUrl 
            : `${API_URL}${imagenUrl}`;
          console.log('📷 Cargando imagen desde:', urlCompleta);
          
          const base64 = await convertirImagenABase64(urlCompleta);
          if (base64) {
            setImagenBase64(base64);
            console.log('✅ Imagen cargada exitosamente');
          } else {
            setErrorImagen(true);
            console.log('❌ Falló la carga de la imagen');
          }
        } catch (error) {
          console.error('Error al cargar imagen:', error);
          setErrorImagen(true);
        }
      }
      setCargando(false);
    };

    cargarImagen();
  }, [asignaciones, imagenBase64Prop]);

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header del modal */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 4v16m8-8H4" />
            </svg>
            Vista Previa del Documento
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Información del documento */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-600">
            {responsable ? `Asignaciones de ${responsable}` : 'Reporte General'}
          </span>
          <span className="text-sm text-gray-600">
            {asignaciones.length} equipos
          </span>
          <div className="flex-1 flex justify-end gap-3">
            <PDFDownloadLink
              document={<PDFDocument 
                asignaciones={asignaciones} 
                responsable={responsable}
                imagenBase64={imagenBase64}
                fechaFirma={fechaFirma}
              />}
              fileName={responsable 
                ? `Compromiso_Asignacion_${responsable.replace(/\s+/g, '_')}.pdf`
                : 'Reporte_Asignaciones.pdf'
              }
              className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
            >
              {({ loading }) => loading ? 'Generando...' : 'Descargar PDF'}
            </PDFDownloadLink>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Vista previa del PDF */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {cargando ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Cargando imagen...</div>
            </div>
          ) : (
            <PDFViewer className="w-full h-full min-h-[600px] rounded-lg">
              <PDFDocument 
                asignaciones={asignaciones} 
                responsable={responsable}
                imagenBase64={imagenBase64}
                fechaFirma={fechaFirma}
              />
            </PDFViewer>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFAsignaciones;