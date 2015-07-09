var PropTypes = React.PropTypes;
var Table = FixedDataTable.Table;
var Column = FixedDataTable.Column;

// function renderImage(/*string*/ cellData) {
//   return <ExampleImage src={cellData} />;
// }
var SortTypes = {
  ASC: 'ASC',
  DESC: 'DESC',
};

AdvanceDataListStore = {
	size: 1000,
	_cache: [],

  createAdvanceRowObjectData:function(index) {
	$.ajax({
		method: "GET",
		url: "db",
		data: { skip: index }
	})
	.done(function( msg ) {
		console.log(msg);
	});
  },

  getObjectAt:function(/*number*/ index) /*?object*/ {
    if (index < 0 || index > this.size){
      return undefined;
    }
    if (this._cache[index] === undefined) {
    	console.log('not in cache');
      // this._cache[index] = this.createAdvanceRowObjectData(index);
    }
    return this._cache[index];
  },

  getSize:function() {
    return this.size;
  }
}

function renderLink(/*string*/ cellData) {
	var h = "#"+cellData;
  return <a href={h}>{cellData}</a>;
}

var AdvancesTable = React.createClass({

  propTypes: {
    onContentDimensionsChange: PropTypes.func,
    left: PropTypes.number,
    top: PropTypes.number,
  },

  _onContentHeightChange:function(contentHeight) {
    this.props.onContentDimensionsChange &&
      this.props.onContentDimensionsChange(contentHeight, 1150);
  },

  getInitialState:function() {
    return {
      dataList: AdvanceDataListStore,
      rows: AdvanceDataListStore._cache,
      sortBy: 'fundId',
      sortDir: null
    }
  },

  _rowGetter:function(index){
    // return this.state.dataList.getObjectAt(index);
    return this.state.rows[index];
  },

  _sortRowsBy:function(cellDataKey) {
    var sortDir = this.state.sortDir;
    var sortBy = cellDataKey;
    if (sortBy === this.state.sortBy) {
      sortDir = this.state.sortDir === SortTypes.ASC ? SortTypes.DESC : SortTypes.ASC;
    } else {
      sortDir = SortTypes.DESC;
    }
    
    var sortedrows = this.state.rows.slice();
    sortedrows.sort(function(a, b){
      var sortVal = 0;
      if (a[sortBy] > b[sortBy]) {
        sortVal = 1;
      }
      if (a[sortBy] < b[sortBy]) {
        sortVal = -1;
      }
      
      if (sortDir === SortTypes.DESC) {
        sortVal = sortVal * -1;
      }
      
      return sortVal;
    });
    this.setState({
      rows:sortedrows,
      sortBy:sortBy,
      sortDir:sortDir,
    });
  },

  _renderHeader:function(label, cellDataKey) {
    return (
      <a onClick={this._sortRowsBy.bind(null, cellDataKey)}>{label}</a>
    );
  },

  render:function() {
    var sortDirArrow = '';

    if (this.state.sortDir !== null){
      sortDirArrow = this.state.sortDir === SortTypes.DESC ? ' ↓' : ' ↑';
    }
    
    var controlledScrolling =
      this.props.left !== undefined || this.props.top !== undefined;

    var schema = [
    	{key:'fundId',label:'Fund Id',width:100,fixed:true,renderer:renderLink},
    	{key:'fundLegId',label:'Fund Leg Id',width:100},
    	{key:'fundDate',label:'Fund Date',width:300},
    	{key:'term',label:'Term',width:100},
		{key:'factorPnt',label:'Factor Point',width:200},
		{key:'fundedAmount',label:'Funded Amount',width:200},
		{key:'paybackAmount',label:'Payback Amount',width:200},
		{key:'status',label:'Status',width:200},
		{key:'zipCode',label:'Zip Code',width:200},
		{key:'sector',label:'Sector',width:400},
		{key:'industry',label:'Industry',width:1000},
    ];

    var columns = [];
    for (var i = 0; i < schema.length; i++) {
    	columns.push(<Column
          headerRenderer={this._renderHeader}
          dataKey={schema[i].key}
          cellRenderer={schema[i].renderer}
          fixed={schema[i].fixed}
          label={schema[i].label + (this.state.sortBy === schema[i].key ? sortDirArrow : '')}
          width={schema[i].width} />);
    };

    return (
      <Table
        rowHeight={50}
        headerHeight={50}
        rowGetter={this._rowGetter}
        rowsCount={this.state.dataList.getSize()}
        width={1200}
        height={800}
        onContentHeightChange={this._onContentHeightChange}
        scrollTop={this.props.top}
        scrollLeft={this.props.left}
        overflowX={controlledScrolling ? "hidden" : "auto"}
        overflowY={controlledScrolling ? "hidden" : "auto"}>
        
        {columns}
      </Table>
    );
  },
});

var FundView = React.createClass({
	getInitialState: function() {
		_this = this;
		window.onhashchange = function(){
			var newFundId = window.location.hash.substring(1);
			$.ajax({
				method: "GET",
				url: "db/payments",
				data: { fundId: newFundId }
			})
			.done(function( result ) {
				_this.setState({
					fundId:newFundId,
					payments:result
				});
			});
		};
		return {fundId:0, payments:[]};
	},

	render:function(){
		_this = this;
		function rowGetter(rowIndex) {
		  return _this.state.payments[rowIndex];
		}
		var schema = [
	    	{key:'id',label:'Payment Id',width:100,fixed:true},
	    	// {key:'merchId',label:'Merchant Id',width:100},
	    	{key:'systemDate',label:'System Date',width:150},
			{key:'amount',label:'Amount',width:200},
	    	{key:'pmtCode',label:'Payment Code',width:100},
			{key:'achCode',label:'ACH Code',width:200}
	    ];

	    var columns = [];
	    for (var i = 0; i < schema.length; i++) {
	    	columns.push(<Column
	          headerRenderer={this._renderHeader}
	          dataKey={schema[i].key}
	          cellRenderer={schema[i].renderer}
	          fixed={schema[i].fixed}
	          label={schema[i].label + (this.state.sortBy === schema[i].key ? sortDirArrow : '')}
	          width={schema[i].width} />);
	    };
		return(
			<div>
			    <div className="letter-holder"> {this.state.fundId}</div>
			    <Table
				    rowHeight={30}
				    rowGetter={rowGetter}
				    rowsCount={this.state.payments.length}
				    width={1200}
				    height={500}
				    headerHeight={50}>
				    {columns}
				  </Table>
			</div>
		);
	}
});


$.ajax({
	method: "GET",
	url: "db/advance/all"
	// data: { skip: index }
})
.done(function( result ) {
  console.log(result.length);
	AdvanceDataListStore._cache = result;
	React.render(<AdvancesTable />,
	  document.getElementById('example'));
	React.render(<FundView />,
	  document.getElementById('fundDetails'));
});