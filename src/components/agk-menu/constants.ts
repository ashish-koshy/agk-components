import { GlobalConstants } from "../../constants"
import { getIconPath } from "../../utils/utils"

const Constants = {
    tag: `agk-menu`,
    renderDelay: 200,
    icons: {
      down: `${getIconPath(GlobalConstants.icons.chevronDown)}`,
      up: `${getIconPath(GlobalConstants.icons.chevronUp)}`,
      check: `${getIconPath(GlobalConstants.icons.check)}`,
    },
  }
  
  export default Constants
  