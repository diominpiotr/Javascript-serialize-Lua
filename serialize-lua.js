serialize_get_type = function( inp ) {
  var type = typeof inp, match;
  if(type == 'object' && !inp)
  {
    return 'null';
  }
  if (type == "object") {
    return 'array';
  }
  return type;
};

function serialize_lua_escape(str) {
  return '"' + (
      str.replace(/([\\"])/g, "\\$1")
         .replace(/\0/g, "\\000")
         .replace(/\n/g, "\\n")
         .replace(/\r/g, "\\r")
    ) + '"'
    ;
}

var LuaKeywords = {
  'and'    : true, 'break'  : true, 'do'   : true, 'else'     : true, 'elseif' : true,
  'end'    : true, 'false'  : true, 'for'  : true, 'function' : true, 'if'     : true,
  'in'     : true, 'local'  : true, 'nil'  : true, 'not'      : true, 'or'     : true,
  'repeat' : true, 'return' : true, 'then' : true, 'true'     : true,
  'until'  : true, 'while'  : true
}

function serialize_lua_escape_key(str) {
  if (LuaKeywords[str]) {
    return '["' + str + '"]';
  }
  if (!str.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/g)) {
    return "[" + serialize_lua_escape(str) + "]";
  }
  return str;
}

function serialize_lua( inp ) {
  var type = serialize_get_type(inp);
  var val;
  switch (type) {
    case "undefined": // Fall through
    case "null":
        val = "nil";
        break;

    case "boolean":
        val = (inp ? "true" : "false");
        break;

    case "number":
        val = inp;
        break;

    case "string":
        val = (inp.match(/^[0-9]+$/) ? parseInt(inp, 10) : inp);
        if (typeof(val) == 'string') {
          val = serialize_lua_escape(inp);
        }
        break;

    case "array": // Fall through
    case "object":
        val = "{";

        var max_k = 0;
        var i;
        for (i=1; ; ++i) {
          if (inp[i] !== undefined) {
            val += serialize_lua(inp[i]) + ","
          } else {
            break;
          }
          max_k = i;
        }

        var nkey;
        for (var key in inp) {
          //string index to number
          nkey = (key.match(/^[0-9]+$/) ? parseInt(key, 10) : key);
          var key_is_number = (typeof(nkey) == 'number');
          if (!(key_is_number && nkey >= 1 && nkey <= max_k)) {
            if (!key_is_number) {
              nkey = serialize_lua_escape_key(nkey);
            } else {
              nkey = "[" + nkey + "]";
            }
            val +=  nkey + "=" +
                    serialize_lua(inp[key]) + ",";
          }
        }
        if (val.charAt(val.length - 1) == ",") {
          val = val.substr(0, val.length - 1);
        }
        val += "}";
        break;
    default:
        document.write("serialize_lua: unknown type " + type + " \n<br>");
        break;
  }
  return val;
}
